import AWS from 'aws-sdk';
import XLSX from 'xlsx';
// Set the region for the S3 bucket
AWS.config.update({ region: 'us-east-1' });

export  const handler = async (event) => {
  try {
    // Get the S3 bucket name and object key from the event
    const  objectKey = event.fileName;
    const bucketName = "acds23termprojectb00945727excel";
    // Create an S3 object instance
    const s3 = new AWS.S3();

    // Get the Excel file from the S3 bucket
    const params = {
      Bucket: bucketName,
      Key: objectKey,
    };
    console.log(params )
    // console.log('Before Getting object from the bucket')
    // // const data = await s3.getObject(params).promise();
    // console.log('After getting object and before reading content')
    // // const fileContent = data.Body.toString('utf-8');
    // console.log('After reading the content and before parsing it')

     // Read the Excel file from the source bucket
    //  const params = { Bucket: srcBucket, Key: srcKey };
     console.log('Before s3 get object')
     const excelFileData = await s3.getObject(params).promise();
     console.log('After S3  get object ')
     // Read the Excel data and extract xValues and yValues
     const workbook = XLSX.read(excelFileData.Body);
     const worksheet = workbook.Sheets[workbook.SheetNames[0]];
     const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // // Parse the Excel file content
    // const workbook = XLSX.read(fileContent, { type: 'binary' });
    // const firstSheetName = workbook.SheetNames[0];
    // const worksheet = workbook.Sheets[firstSheetName];
    // const parsedData = XLSX.utils.sheet_to_json(worksheet);

    console.log('AFter parsing')
    console.log("ParsedData :"+jsonData)
    return {
      statusCode: 200,
      body: jsonData
    };
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error reading Excel file' }),
    };
  }
};
