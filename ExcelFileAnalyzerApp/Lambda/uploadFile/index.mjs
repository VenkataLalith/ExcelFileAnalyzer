import AWS from "aws-sdk"
import XLSX from "xlsx"
const s3 = new AWS.S3();

export const handler = async (event) => {
  try {
    console.log('Received Event :'+JSON.stringify(event))
    const fileData = event.fileData;

    // Convert the fileData into a worksheet data array
    const worksheetData = fileData.map((item) => ({
      Year: item.Year,
      Sales: typeof item["Sales,"] === "string" ? parseInt(item["Sales,"].replace(",", "")) : item["Sales,"],
      Location: item.Location.trim(),
    }));
    console.log('Workbook Data :'+worksheetData)
    const fileName = event.fileName;
    console.log('Before workbook. creation.....')
    
    // Process the data and create a new Excel file (replace the following line with your data processing logic)
    // const processedData = [["Example", "Data"], ["Value 1", "Value 2"]];

    const newWorkbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(newWorkbook, worksheet, fileName);

    console.log('After excel creation');
    console.log('Before writing data');
    // Convert the new Excel file to buffer
    const buffer = XLSX.write(newWorkbook, { type: "buffer" });
    console.log('After buffer writing')
    // Upload the new Excel file to S3 bucket
    const params = {
      Bucket: "acds23termprojectb00945727excel",
      Key: fileName,
      Body: buffer
    };

    console.log("Params :"+JSON.stringify(params))
    console.log('Before Uploading')
    await s3.upload(params).promise();
    console.log('After Uploading');
    return {
      statusCode: 200,
      body: "File uploaded successfully!",
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: "Error uploading file.",
    };
  }
};
