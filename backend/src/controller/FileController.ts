import {GridFsStorage} from "multer-gridfs-storage";
import env from "../util/validateEnv";
import multer from "multer";
import express, {RequestHandler} from "express";
import Account from "../models/account";


interface MulterFile extends Express.Multer.File {
    id: string;
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

        console.log("I am in the backend");

        upload.single('file')(req, res, async (err: any) => {
            if (err) {
                return res.status(400).json({
                    error: "Bad Request",
                    message: "Invalid file."
                });
            }

            if (fileType === 'profileImage') {
                user.profileImageId = (req.file as MulterFile).id;
                console.log("user.profileImageId: ", user.profileImageId);
            } else if (fileType === 'certificate') {
                user.certificates.push((req.file as MulterFile).id);
            }
            console.log(req.file);
            await user.save();
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




