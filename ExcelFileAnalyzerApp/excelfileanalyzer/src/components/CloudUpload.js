import React, { useState, useEffect } from 'react';
import {
    Button,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import domtoimage from 'dom-to-image';
// import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// const FileInput = styled('input')({
//     display: 'none',
// });

const WelcomeMessage = () => {
    const [fileData, setFileData] = useState(null);
    const [columns, setColumns] = useState([]);
    const [xAxis, setXAxis] = useState('');
    const [yAxis, setYAxis] = useState('');
    const [file, setFile] = useState(null); // State to store the file object
    const [chartData, setChartData] = useState(null);
    const [fileName, setFileName] = useState('');
    const [listItems, setListItems] = useState([]);
    const [selectedValue, setSelectedValue] = useState('');


    useEffect(() => {
        // Fetch the list of items from the Lambda function API on component mount
        const fetchList = async () => {
            try {
                // const response = await axios.post('https://f5iy1jo926.execute-api.us-east-1.amazonaws.com/default/fetchListOfFiles');
                const response = await axios.post('https://u5s4x6dlqb.execute-api.us-east-1.amazonaws.com/production/getFilesList');
                
                const list = response.data.body;
                console.log('List :' + list.body)
                setListItems(list);
            } catch (error) {
                console.error('Error fetching list:', error);
            }
        };

        fetchList();
    }, []);

    const handleSelectChange = (event) => {
        setSelectedValue(event.target.value);
    };

    const handleSubmit = async () => {
        try {
            // Call the second Lambda function API with the selected value
            const payload = { fileName: selectedValue };
            
            // const response = await axios.post('https://f5iy1jo926.execute-api.us-east-1.amazonaws.com/default/getCloudFileData', payload);
            const response = await axios.post('https://u5s4x6dlqb.execute-api.us-east-1.amazonaws.com/production/getCloudData',payload);
                
            console.log('Response ',response)
            const data = response.data.body
            console.log('Data :',data)
            setFileData(data);
            // Reset the selected value after successful submission
            setSelectedValue('');
            if (data.length > 0) {
                const headerRow = Object.keys(data[0]);
                setColumns(headerRow);
              }
        } catch (error) {
            console.error('Error submitting value:', error);
        }
    };

    const handleFileUpload = async () => {
        // Ensure that both X-axis and Y-axis columns are selected
        if (!xAxis || !yAxis) {
            alert('Please select both X-axis and Y-axis columns.');
            return;
        }

        await generateGraph();
        console.log('File name :' + fileName);
        const payload = {
            fileData,
            fileName: fileName
        };

        const headers = {
            'Content-Type': 'application/json'
        };

        // const lambdaFunctionEndpoint = 'https://f5iy1jo926.execute-api.us-east-1.amazonaws.com/default/uploadFileData';
        const lambdaFunctionEndpoint = 'https://u5s4x6dlqb.execute-api.us-east-1.amazonaws.com/production/uploadFile'
        const response = await axios.post(lambdaFunctionEndpoint, payload, { headers });


        alert('Data sent to Lambda function successfully!');
    };

    const captureGraphAsImage = () => {

        const chartNode = document.getElementById('chart-container');
        if (chartNode) {
            domtoimage.toBlob(chartNode).then((blob) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const imageBase64 = reader.result.split(',')[1]; // Extract the Base64 string from the Data URL
                    // console.log("Base 64 STring :"+imageBase64)
                    // const lambdaFunctionEndpoint = 'https://f5iy1jo926.execute-api.us-east-1.amazonaws.com/default/uploadGraphImage'; // Replace with your Lambda function endpoint
                   const lambdaFunctionEndpoint = 'https://u5s4x6dlqb.execute-api.us-east-1.amazonaws.com/production/uploadImage'
                    const payload = {
                        imageBase64, // Use the Base64-encoded image string obtained from capturing the image
                        fileName: fileName, // Replace with your desired image file name
                    };

                    axios.post(lambdaFunctionEndpoint, payload)
                        .then((response) => {
                            const res = response.data.body;
                            const body = JSON.parse(res);
                            console.log('Body :' + body);
                            console.log("Url :" + body.imageUrl)
                            const lambdaEndpoint = 'https://u5s4x6dlqb.execute-api.us-east-1.amazonaws.com/production/pushToQueue';
                            const queuePayload = {
                                message: body.imageUrl
                            }
                            axios.post(lambdaEndpoint, queuePayload).then(() => {

                            })
                                .catch((error) => {
                                    console.log("error ", error)
                                    alert('Error publishing stats')
                                })
                            alert('Image uploaded to S3 bucket successfully!');
                        })
                        .catch((error) => {
                            console.error('Error uploading image to S3 bucket:', error);
                            alert('Error uploading image to S3 bucket. Please try again.');
                        });
                };
                reader.readAsDataURL(blob); // Read the Blob as Data URL
            });
        }


    };


    const generateGraph = async () => {
        // Create data for the chart
        const chartData = fileData.map((row) => ({
            [xAxis]: row[xAxis],
            [yAxis]: row[yAxis],
        }));

        setChartData(chartData);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile); // Store the selected file in the state

        const reader = new FileReader();

        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const parsedData = XLSX.utils.sheet_to_json(worksheet);

            setFileData(parsedData);

            if (parsedData.length > 0) {
                const headerRow = Object.keys(parsedData[0]);
                setColumns(headerRow);
            }
        };

        reader.readAsArrayBuffer(selectedFile);
        setFileName(selectedFile.name);
    };

    const handleXAxisChange = (e) => {
        setXAxis(e.target.value);
    };

    const handleYAxisChange = (e) => {
        setYAxis(e.target.value);
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom>
                Upload From Cloud
            </Typography>
            {
                listItems && (
                    <Container maxWidth="sm">
                        <Typography variant="h6" gutterBottom>
                            Listof your previously uploaded files
                        </Typography>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel htmlFor="select-item">Select an item</InputLabel>
                            <Select
                                id="select-item"
                                value={selectedValue}
                                onChange={handleSelectChange}
                                label="Select an item"
                                fullWidth
                                sx={{ mt: 2 }}
                            >
                                <MenuItem value="">
                                    <em>Select an item</em>
                                </MenuItem>
                                {listItems.map((item) => (
                                    <MenuItem key={item} value={item}>
                                        {item}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
                            Get Data
                        </Button>
                    </Container>
                )
            }
            {fileData && (
                <div>
                    <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
                        <InputLabel htmlFor="x-axis-select">Select X-Axis Column</InputLabel>
                        <Select id="x-axis-select" value={xAxis} label="Select X-Axis Column" onChange={handleXAxisChange}>
                            <MenuItem value="">
                                <em>Select X-Axis</em>
                            </MenuItem>
                            {columns.map((column, index) => (
                                <MenuItem key={index} value={column}>
                                    {column}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
                        <InputLabel htmlFor="y-axis-select">Select Y-Axis Column</InputLabel>
                        <Select id="y-axis-select" value={yAxis} label="Select Y-Axis Column" onChange={handleYAxisChange}>
                            <MenuItem value="">
                                <em>Select Y-Axis</em>
                            </MenuItem>
                            {columns.map((column, index) => (
                                <MenuItem key={index} value={column}>
                                    {column}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button variant="contained" color="primary" onClick={handleFileUpload} sx={{ mt: 2 }}>
                        Submit
                    </Button>
                    <Button variant="contained" color="primary" onClick={captureGraphAsImage} sx={{ mt: 2 }}>
                        Capture Image
                    </Button>
                    {fileData && xAxis && yAxis && chartData && chartData.length > 0 && (
                        <div>
                            <Typography variant="h5" sx={{ mt: 2 }}>
                                Generated Graph
                            </Typography>
                            <ResponsiveContainer id="chart-container" width="100%" height={350}>
                                <BarChart data={chartData}>
                                    <XAxis dataKey={xAxis} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey={yAxis} fill="rgba(75, 192, 192, 0.6)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    <Table sx={{ mt: 2 }}>
                        <TableHead>
                            <TableRow>
                                {columns.map((column, index) => (
                                    <TableCell key={index}>{column}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fileData.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {columns.map((column, columnIndex) => (
                                        <TableCell key={columnIndex}>{row[column]}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </Container>
    );
};

export default WelcomeMessage;


