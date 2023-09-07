import AWS from 'aws-sdk';

const s3 = new AWS.S3();

export const handler = async (event) => {
    const { imageBase64, fileName } = event; // Assuming the payload is in the request body

    console.log('Before Buffer :');
  // Convert the Base64-encoded image string to a Buffer
  const imageBuffer = Buffer.from(imageBase64, 'base64');
    console.log('After Buffer ');
  // Define the S3 bucket name and the object key (file name)
  const bucketName = 'acds23termprojectb00945727graphimages';
  const objectKey = `${fileName}.jpeg`;

  // Set the S3 bucket parameters
  const params = {
    Bucket: bucketName,
    Key: objectKey,
    Body: imageBuffer,
    ContentType: 'image/jpeg', // Adjust the content type as per your requirement
  };

  try {
    console.log('Before upload ')
    // Upload the image to the S3 bucket
    const result = await s3.upload(params).promise();
    console.log('After Upload ');
    // Return the URL of the uploaded image
    const imageUrl = result.Location;

    return {
      statusCode: 200,
      body: JSON.stringify({ imageUrl }),
    };
  } catch (error) {
    console.error('Error uploading image to S3:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to upload image to S3' }),
    };
  }
};
