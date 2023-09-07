import AWS from 'aws-sdk';
const s3 = new AWS.S3();

export const handler = async (event, context) => {
  try {
    const bucketName = 'acds23termprojectb00945727excel'; // Replace with your S3 bucket name
    let names = [];
    // Get the list of objects (files) in the bucket
    const params = {
      Bucket: bucketName,
    };
    const s3Response = await s3.listObjectsV2(params).promise();

    // Extract the file names from the S3 response
    const fileNames = s3Response.Contents.map((obj) => {
        console.log(obj.Key)
        if(!obj.Key.includes('images'))  {
            names.push(obj.Key)
        }  
    });
    console.log('File Name :'+fileNames)
    return {
      statusCode: 200,
      body: names
    };
  } catch (error) {
    console.error('Error fetching file names:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching file names' }),
    };
  }
};
