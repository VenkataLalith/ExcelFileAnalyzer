import AWS from 'aws-sdk'
const sqs = new AWS.SQS();

export const handler = async (event) => {
  try {
    // Process each message received from the SQS queue
    console.log('Event : '+JSON.stringify(event))
    let msg;
    for (const record of event.Records) {
      const message = record.body; // Assuming the message is in JSON format
        msg = message;
      // Process the message as needed
      console.log('Received Message:', message);

      // Delete the processed message from the SQS queue
      const deleteParams = {
        QueueUrl: 'https://sqs.us-east-1.amazonaws.com/621688211331/ImageUrlQueue', // Get the QueueUrl from the eventSourceARN
        ReceiptHandle: record.receiptHandle,
      };
      await sqs.deleteMessage(deleteParams).promise();
    }

    const topicArn = 'arn:aws:sns:us-east-1:621688211331:acds23b00945727';

    // Create an instance of the SNS service
    const sns = new AWS.SNS();


    // Set the parameters for publishing the message
    const params = {
      TopicArn: topicArn,
      Message: 'The sales report graph : Please download by clicking below link \n'+msg
    };

    // Publish the message to the SNS topic
   const result =  await sns.publish(params).promise();

    console.log('Message published successfully:', msg);

    console.log("result : ",result)
    return {
      statusCode: 200,
      body: JSON.stringify('Messages processed successfully!'),
    };
  } catch (error) {
    console.error('Error processing messages from SQS queue:', error);
    return {
      statusCode: 500,
      body: JSON.stringify('Error processing messages from SQS queue. Please try again.'),
    };
  }
};
