import {GridFsStorage} from "multer-gridfs-storage";
import env from "../util/validateEnv";
import multer from "multer";
import express, {RequestHandler} from "express";
import Account, {IAccount} from "../models/account";
import {MongoClient, GridFSBucket, ObjectId} from "mongodb";
import ServiceOffering, {IServiceOffering} from "../models/serviceOffering";

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

/**
 * Upload a certificate for a service
 * @param req
 * @param res
 */
export const uploadCertificate: RequestHandler = async (req, res) => {
    try {
        const serviceId = req.params.serviceId;
        const service = await ServiceOffering.findById(serviceId);

        // Check if the service exists
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
            // Delete the old certificate if it exists
            if (service.get('certificateId') != "" && service.get('certificateId') != null && service.get('certificateId') != undefined) {
                const _id = new ObjectId(service.get('certificateId'));
                bucket.delete(_id).then(() => {
                    console.log("Certificate deleted successfully");
                });
            }

            // Save the new certificate
            const certificateId = (req.file as MulterFile).id.toString();

            // Update the service offering with the new certificate
            // TODO: Check if the service is already certified -> isCertified check should not be here
            const updates = {certificateId: certificateId, isCertified: false};


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

/**
 * Get a certificate for a service
 * @param req
 * @param res
 */
export const getCertificate: RequestHandler = async (req, res) => {
    try {
        const serviceId = req.params.serviceId;
        const service = await ServiceOffering.findById(serviceId);

        // Check if the service exists
        if (!service) {
            console.log("Service not found");
            return res.status(404).json({
                error: "Not Found",
                message: "Service not found."
            });
        }
        try {
            // Check if the certificate exists
            if (service.get('certificateId') === "" || service.get('certificateId') === null || service.get('certificateId') === undefined) {
                return;
            }

            const _id = new ObjectId(service.get('certificateId'));

            const downloadStream = bucket.openDownloadStream(_id);

            // Specify the response type and disposition
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="certificate.pdf"');

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

/**
 * Delete a certificate for a service
 * @param req
 * @param res
 */
export const deleteCertificate: RequestHandler = async (req, res) => {
    try {
        const serviceId = req.params.serviceId;
        const service = await ServiceOffering.findById(serviceId);

        // Check if the service exists
        if (!service) {
            console.log("Service not found");
            return res.status(404).json({
                error: "Not Found",
                message: "Service not found."
            });
        }
        console.log("Service found");
        // Check if the certificate exists
        // No matter iscertified is true or false, the certificate can be deleted
        if (service.get('certificateId') === "" || service.get('certificateId') === null || service.get('certificateId') === undefined) {
            console.log("Certificate not found");
            return;
        }
        const _id = new ObjectId(service.get('certificateId'));
        bucket.delete(_id).then(async () => {
            const updateService = await ServiceOffering.findOneAndUpdate({_id: serviceId}, {
                certificateId: "",
                isCertified: false
            }, {
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

/**
 * Fetch all unverified certificates
 * @param req
 * @param res
 */
export const fetchUncheckedCertificates: RequestHandler = async (req, res) => {
    try {
        const unverifiedServices = await ServiceOffering.find({
            certificateId: {$ne: "", $exists: true},
            $or: [{isCertificateChecked: false}, {isCertificateChecked: null}]
        }).populate<{ provider: IAccount }>('provider').exec();

        const results = await Promise.all(
            unverifiedServices.map(async service => {
                return {
                    email: service.provider.email,
                    serviceType: service.serviceType,
                    isCertified: service.isCertified,
                    serviceId: service._id,
                };
            })
        );
        res.status(200).json(results);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching unverified certificates');
    }
};

/**
 * Fetch all unverified certificates
 * @param req
 * @param res
 */
export const fetchCheckedCertificates: RequestHandler = async (req, res) => {
    try {
        const verifiedServices = await ServiceOffering.find({
            certificateId: {$ne: "", $exists: true}, isCertificateChecked: true
        }).populate<{ provider: IAccount }>('provider').exec();

        const results = await Promise.all(
            verifiedServices.map(async service => {
                return {
                    email: service.provider.email,
                    serviceType: service.serviceType,
                    isCertified: service.isCertified,
                    serviceId: service._id,
                };
            })
        );
        res.status(200).json(results);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching verified certificates');
    }
};


/**
 * Verify a certificate
 * @param req
 * @param res
 */
export const verifyCertificate: RequestHandler = async (req, res) => {
    try {
        const serviceId = req.body.serviceId;
        const service = await ServiceOffering.findById(serviceId);

        if (!service) {
            return res.status(404).json({message: 'Service not found'});
        }

        const updatedService = await ServiceOffering.findOneAndUpdate({_id: serviceId}, {isCertified: true, isCertificateChecked: true}, {
            new: true,
            upsert: true,
            strict: false
        });

        if (!updatedService) {
            return res.status(404).send({message: 'Service not found'});
        }
        return res.status(200).send('Certificate verified successfully');
    } catch (error) {
        return res.status(400).json({error: 'Invalid File ID'});
    }
}

export const declineCertificate: RequestHandler = async (req, res) => {
    try {
        const serviceId = req.body.serviceId;
        const service = await ServiceOffering.findById(serviceId);

        if (!service) {
            return res.status(404).json({message: 'Service not found'});
        }

        const updatedService = await ServiceOffering.findOneAndUpdate({_id: serviceId}, {isCertified: false, isCertificateChecked: true}, {
            new: true,
            upsert: true,
            strict: false
        });

        if (!updatedService) {
            return res.status(404).send({message: 'Service not found'});
        }
        return res.status(200).send('Certificate verified successfully');
    } catch (error) {
        return res.status(400).json({error: 'Invalid File ID'});
    }

}

/**
 * Verify a certificate
 * @param req
 * @param res
 */
export const revertVerifyCertificate: RequestHandler = async (req, res) => {
    try {
        const serviceId = req.body.serviceId;
        const service = await ServiceOffering.findById(serviceId);

        if (!service) {
            return res.status(404).json({message: 'Service not found'});
        }

        const updatedService = await ServiceOffering.findOneAndUpdate({_id: serviceId}, {isCertified: false, isCertificateChecked: false}, {
            new: true,
            upsert: true,
            strict: false
        });

        if (!updatedService) {
            return res.status(404).send({message: 'Service not found'});
        }
        return res.status(200).send('Certificate verified successfully');
    } catch (error) {
        return res.status(400).json({error: 'Invalid File ID'});
    }
}



