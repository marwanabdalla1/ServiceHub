import {GridFsStorage} from "multer-gridfs-storage";
import env from "../../util/validateEnv";
import multer from "multer";
import express, {RequestHandler} from "express";
import Account from "../../models/account";
import {GridFSBucket, MongoClient, ObjectId} from "mongodb";

interface MulterFile extends Express.Multer.File {
    id: ObjectId;
}

// Set up GridFS storage engine
const storage = new GridFsStorage({
    url: env.MONGO_CONNECTION_STRING!,
    options: {useNewUrlParser: true, useUnifiedTopology: true},
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const filename = `file-${Date.now()}${file.originalname}`;
            const fileInfo = {
                filename: filename,
                bucketName: 'profileImages'
            };
            resolve(fileInfo);
        });
    }
});

let bucket: GridFSBucket;
MongoClient.connect(env.MONGO_CONNECTION_STRING!,)
    .then((client: MongoClient) => {
        const db = client.db('ServiceHub');
        bucket = new GridFSBucket(db, {
            bucketName: 'profileImages'
        });
    })
    .catch((err: Error) => {
        console.error("Failed to connect to MongoDB or set up GridFSBucket:", err);
        throw err;
    });

const upload = multer({storage});

/**
 * Uploads a profile image for the user
 * @param req
 * @param res
 */
export const uploadProfileImage: RequestHandler = async (req, res) => {
    try {
        let userId;

        if (req.params.accountId) {
            userId = req.params.accountId;
        } else {
            userId = (req as any).user.userId;
        }

        const user = await Account.findById(userId);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({
                error: "Not Found",
                message: "User not found."
            });
        }

        upload.single('file')(req, res, async (err: any) => {
            if (err) {
                return res.status(400).json({
                    error: "Bad Request",
                    message: "Invalid file."
                });
            }

            // Delete the previous profile image if it exists
            if (user.get('profileImageId') != "" && user.get('profileImageId') != null && user.get('profileImageId') != undefined) {
                // console.log("Profile Image exists with ID: ", user.get('profileImageId'));
                const _id = new ObjectId(user.get('profileImageId'));
                bucket.delete(_id).then(() => {
                    console.log("Profile Image deleted successfully");

                });
            }
            const profileImageId = (req.file as MulterFile).id.toString();
            const updates = {profileImageId: profileImageId};

            const updatedUser = await Account.findOneAndUpdate({_id: userId}, updates, {
                new: true,
                upsert: true,
                strict: false
            });
            if (!updatedUser) {
                return res.status(404).send({message: 'User not found'});
            }
            // console.log("user: ", updatedUser);
            return res.status(200).json(req.file);
        });
    } catch (err: any) {
        let message = '';
        if (err instanceof Error) {
            message = err.message;
        }
        return res.status(500).json({
            error: "Internal server error",
            message: message,
        });
    }
}

/**
 * Gets the profile image for the user
 * @param userId
 * @param res
 */
async function getProfileImage(userId: string, res: express.Response) {
    const user = await Account.findById(userId);

    if (!user) {
        return res.status(404).json({
            error: "Not Found",
            message: "User not found."
        });
    }
    try {
        if (user.get('profileImageId') === "" || user.get('profileImageId') === null || user.get('profileImageId') === undefined) {
            // console.log("No profile image found for user: ", user.get('firstName'));
            return res.status(404).json({error: 'No profile image found for user'});
        }
        const _id = new ObjectId(user.get('profileImageId'));
        // console.log("Profile Image ID: ", _id);

        const downloadStream = bucket.openDownloadStream(_id);

        downloadStream.on('data', (chunk) => {
            res.write(chunk);
        });

        downloadStream.on('error', function (error) {
            return;
        });

        downloadStream.on('end', () => {
            res.end();
        });

    } catch (error) {
        console.error("Error with ObjectId conversion:", error);
        return res.status(400).json({error: 'Invalid image ID provided'});
    }
}

/**
 * Gets the profile image for the user
 * @param req
 * @param res
 */
export const getProfileImageByAuth: RequestHandler = async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        await getProfileImage(userId, res);

    } catch (error) {
        return res.status(400).json({error: 'Invalid File ID'});
    }
}

export const getProfileImageByUserId: RequestHandler = async (req, res) => {
    try {
        const userId = req.params.userId
        // console.log("User ID: ", userId);
        await getProfileImage(userId, res);

    } catch (error) {
        return res.status(400).json({error: 'Invalid File ID'});
    }
}
/**
 * Deletes the profile image for the user
 * @param req
 * @param res
 */
export const deleteProfileImage: RequestHandler = async (req, res) => {
    try {
        let userId;
        if (req.params.accountId) {
            userId = req.params.accountId;
        } else {
            userId = (req as any).user.userId;
        }
        const user = await Account.findById(userId);
        if (!user) {
            return res.status(404).json({
                error: "Not Found",
                message: "User not found."
            });
        }
        const _id = new ObjectId(user.get('profileImageId'));
        bucket.delete(_id).then(async () => {
            const updatedUser = await Account.findOneAndUpdate({_id: userId}, {profileImageId: ""}, {
                new: true,
                upsert: true,
                strict: false
            });
            if (!updatedUser) {
                return res.status(404).send({message: 'User not found'});
            }
            return res.status(200).json({message: 'Profile Image deleted successfully'});
        });
    } catch (error) {
        return res.status(400).json({error: 'Invalid File ID'});
    }
}






