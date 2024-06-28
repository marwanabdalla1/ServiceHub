import {GridFsStorage} from "multer-gridfs-storage";
import env from "../util/validateEnv";
import multer from "multer";
import express, {RequestHandler} from "express";
import Account from "../models/account";
import {MongoClient, GridFSBucket, ObjectId} from "mongodb";
import ServiceOffering from "../models/serviceOffering";

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
                bucketName: 'certificate'
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
            bucketName: 'certificate'
        });
    })
    .catch((err: Error) => {
        console.error("Failed to connect to MongoDB or set up GridFSBucket:", err);
        throw err;
    });

const upload = multer({storage});

export const uploadCertificate: RequestHandler = async (req, res) => {
    try {
        const serviceId = req.params.serviceId;
        const service = await ServiceOffering.findById(serviceId);

        if (!service) {
            console.log("Service not found");
            return res.status(404).json({
                error: "Not Found",
                message: "Service not found."
            });
        }

        upload.single('file')(req, res, async (err: any) => {
            if (err) {
                return res.status(400).json({
                    error: "Bad Request",
                    message: "Invalid file."
                });
            }
            if (service.get('certificateId') != "" && service.get('certificateId') != null && service.get('certificateId') != undefined) {
                console.log(service.get('certificateId'));
                const _id = new ObjectId(service.get('certificateId'));
                bucket.delete(_id).then(() => {
                    console.log("Certificate deleted successfully");
                });
            }
            const certificateId = (req.file as MulterFile).id.toString();
            const updates = {certificateId: certificateId};

            const updatedService = await ServiceOffering.findOneAndUpdate({_id: serviceId}, updates, {
                new: true,
                upsert: true,
                strict: false
            });
            if (!updatedService) {
                return res.status(404).send({message: 'Service not found'});
            }
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

export const getCertificate: RequestHandler = async (req, res) => {
    try {
        const serviceId = req.params.serviceId;
        console.log(serviceId);
        const service = await ServiceOffering.findById(serviceId);
        console.log(service);
        if (!service) {
            console.log("Service not found");
            return res.status(404).json({
                error: "Not Found",
                message: "Service not found."
            });
        }
        try {
            if (service.get('certificateId') === "") {
                return;
            }
            const _id = new ObjectId(service.get('certificateId'));

            const downloadStream = bucket.openDownloadStream(_id);

            downloadStream.on('data', (chunk) => {
                res.write(chunk);
            });

            downloadStream.on('error', function (error) {
                return res.status(404).json({error: 'File not found'});
            });

            downloadStream.on('end', () => {
                res.end();
            });

        } catch (error) {
            console.error("Error with ObjectId conversion:", error);
            return res.status(400).json({error: 'Invalid File ID'});
        }

    } catch (error) {
        return res.status(400).json({error: 'Invalid File ID'});
    }
}

export const deleteCertificate: RequestHandler = async (req, res) => {
    try {
        const serviceId = req.params.serviceId;
        const service = await ServiceOffering.findById(serviceId);
        if (!service) {
            return res.status(404).json({
                error: "Not Found",
                message: "Service not found."
            });
        }
        if (service.get('certificateId') === "" || service.get('certificateId') === null || service.get('certificateId') === undefined) {
            return;
        }
        const _id = new ObjectId(service.get('certificateId'));
        bucket.delete(_id).then(async () => {
            const updateService = await ServiceOffering.findOneAndUpdate({_id: serviceId}, {certificateId: ""}, {
                new: true,
                upsert: true,
                strict: false
            });
            if (!updateService) {
                return res.status(404).send({message: 'Service not found'});
            }
            return res.status(200).send('Certificate deleted successfully');
        });
    } catch (error) {
        return res.status(400).json({error: 'Invalid File ID'});
    }
}






