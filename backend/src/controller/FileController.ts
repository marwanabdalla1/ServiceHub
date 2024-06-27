import {GridFsStorage} from "multer-gridfs-storage";
import env from "../util/validateEnv";
import multer from "multer";
import express, {RequestHandler} from "express";
import Account from "../models/account";
import {MongoClient, GridFSBucket, ObjectId} from "mongodb";


interface MulterFile extends Express.Multer.File {
    id: ObjectId;
}

const storage = new GridFsStorage({
    url: env.MONGO_CONNECTION_STRING!,
    options: {useNewUrlParser: true, useUnifiedTopology: true},
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const filename = `file-${Date.now()}${file.originalname}`;
            const fileInfo = {
                filename: filename,
                bucketName: 'uploads'
            };
            resolve(fileInfo);
        });
    }
});

let bucket: GridFSBucket;
MongoClient.connect(env.MONGO_CONNECTION_STRING!)
    .then((client: MongoClient) => {
        // Successfully connected to MongoDB
        console.log("Connected successfully to MongoDB");

        // Access the specific database
        const db = client.db('SEBA22');
        console.log("Database connected: " + db.databaseName);

        // Setup the GridFS bucket
        bucket = new GridFSBucket(db, {
            bucketName: 'uploads'
        });
        console.log("GridFS Bucket is set up with the bucket name: 'uploads'");

        // Additional check: List the first file in the bucket to confirm connection
        bucket.find({}).limit(1).toArray().then((files) => {
            if (files.length > 0) {
                console.log("Successfully found files in GridFS, example file:", files[0]);
            } else {
                console.log("No files found in GridFS, but the bucket is correctly set up.");
            }
        }).catch((err) => {
            if (err) {
                console.error("Error listing files from GridFS: ", err);
                return;
            }
        });
    })
    .catch((err: Error) => {
        console.error("Failed to connect to MongoDB or set up GridFSBucket:", err);
        throw err;
    });

const upload = multer({storage});

export const uploadFile: RequestHandler = async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const user = await Account.findById(userId);
        const fileType = req.params.fileType; // 'profileImage' or 'certificate'

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

            let updates = {};

            if (fileType === 'profileImage') {
                // TODO: delete old profile image
                const profileImageId = (req.file as MulterFile).id.toString();
                updates = {profileImageId: profileImageId};

            } else if (fileType === 'certificate') {
                // TODO
            }
            console.log("updates: ", updates);
            const updatedUser = await Account.findOneAndUpdate({_id: userId}, updates, {
                new: true,
                upsert: true,
                strict: false
            });
            if (!updatedUser) {
                return res.status(404).send({message: 'User not found'});
            }
            console.log("user: ", updatedUser);
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

export const getFile: RequestHandler = async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const user = await Account.findById(userId);
        const fileType = req.params.fileType; // 'profileImage' or 'certificate'

        if (!user) {
            return res.status(404).json({
                error: "Not Found",
                message: "User not found."
            });
        }

        if (fileType === 'profileImage') {
            console.log("user.profileImageId: ", user.get('profileImageId'));

            try {
                // const _id = new ObjectId(user.get('profileImageId'));
                const _id = new ObjectId("667a680e807dd388ca77ec34");
                console.log("_id: ", _id);

                const downloadStream = bucket.openDownloadStream(_id);

                console.log('Download stream:', downloadStream); // Log the result of the openDownloadStream call

                downloadStream.on('data', (chunk) => {
                    res.write(chunk);
                });

                downloadStream.on('error', function (error) {
                    console.error("Error downloading file:", error);
                    return res.status(404).json({error: 'File not found'});
                });

                downloadStream.on('end', () => {
                    res.end();
                });

            } catch (error) {
                console.error("Error with ObjectId conversion:", error);
                return res.status(400).json({error: 'Invalid image ID provided'});
            }
        } else if (fileType === 'certificate') {
            // TODO
        }
    } catch (error) {
        return res.status(400).json({error: 'Invalid File ID'});
    }
}

export const getFileById: RequestHandler = async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const user = await Account.findById(userId);
        const fileType = req.params.fileType; // 'profileImage' or 'certificate'
        const fileId = req.params.fileId;

        if (!user) {
            return res.status(404).json({
                error: "Not Found",
                message: "User not found."
            });
        }

        if (fileType === 'profileImage') {
            const _id = new ObjectId(fileId);

            const downloadStream = bucket.openDownloadStream(_id);
            downloadStream.on('error', function (error) {
                return res.status(404).json({error: 'File not found'});
            });
            downloadStream.pipe(res);
        } else if (fileType === 'certificate') {
            // TODO
        }
    } catch (error) {
        return res.status(400).json({error: 'Invalid File ID'});
    }

}

export const deleteFileById: RequestHandler = async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const fileId = req.params.fileId;
        const user = await Account.findById(userId);
        const fileType = req.params.fileType; // 'profileImage' or 'certificate'
        if (!user) {
            return res.status(404).json({
                error: "Not Found",
                message: "User not found."
            });
        }
        const _id = new ObjectId(user.profileImageId);
        bucket.delete(_id).then(() => {
            if (fileType === 'profileImage') {
                user.profileImageId = '';
                user.save();
                return res.status(200).json({message: 'Profile Image deleted successfully'});
            } else if (fileType === 'certificate') {
                // TODO
            }
        });
    } catch (error) {
        return res.status(400).json({error: 'Invalid File ID'});
    }
}






