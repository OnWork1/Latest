import {
  DeleteObjectCommand,
  type DeleteObjectCommandInput,
  GetObjectCommand,
  PutObjectCommand,
  type PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import type ReceiptInputDto from '../dtos/receipt/receipt-input.dto';
import { Readable } from 'stream';

export default class S3FileService {
  constructor(private user: string) {
    if (
      process.env.S3_REGION &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_ACCESS_KEY
    ) {
      if (
        process.env.S3_REGION!.trim() == '' ||
        process.env.S3_ACCESS_KEY_ID!.trim() == '' ||
        process.env.S3_ACCESS_KEY!.trim() == ''
      ) {
        throw Error('File upload configuration error..!');
      }
    } else {
      throw Error('File upload configuration error..!');
    }
  }

  async upload(receipt: ReceiptInputDto): Promise<unknown> {
    const input: PutObjectCommandInput = {
      Body: receipt.file,
      Bucket: process.env.S3_RECEIPT_BUCKET_NAME!,
      Key: receipt.filePath,
    };
    const s3client = new S3Client({
      region: process.env.S3_REGION!,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_ACCESS_KEY!,
      },
    });
    const command = new PutObjectCommand(input);
    const response = await s3client.send(command);

    return response.$metadata.httpStatusCode;
  }

  async download(fileKey: string): Promise<Readable> {
    const getInput: PutObjectCommandInput = {
      Bucket: process.env.S3_RECEIPT_BUCKET_NAME!,
      Key: fileKey,
    };

    const s3client = new S3Client({
      region: process.env.S3_REGION!,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_ACCESS_KEY!,
      },
    });

    const command = new GetObjectCommand(getInput);
    const response = await s3client.send(command);

    return response.Body as Readable;
  }

  async delete(fileKey: string): Promise<boolean> {
    const deleteInput: DeleteObjectCommandInput = {
      Bucket: process.env.S3_RECEIPT_BUCKET_NAME!,
      Key: fileKey,
    };

    const s3client = new S3Client({
      region: process.env.S3_REGION!,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_ACCESS_KEY!,
      },
    });

    const command = new DeleteObjectCommand(deleteInput);
    const response = await s3client.send(command);

    return response.DeleteMarker!;
  }
}
