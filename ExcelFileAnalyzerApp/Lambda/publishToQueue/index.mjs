import AWS from 'aws-sdk';
const sqs = new AWS.SQS();

export const handler = async (event) => {
  try {
    const queueUrl = 'https://sqs.us-east-1.amazonaws.com/621688211331/ImageUrlQueue'; // Replace with your SQS queue URL

    const message = {
      MessageBody: event.message,
      DelaySeconds: 0, // You can set a delay (in seconds) for the message to be visible in the queue
    };

    const params = {
      MessageAttributes: {},
      MessageBody: message.MessageBody,
      QueueUrl: queueUrl,
      DelaySeconds: message.DelaySeconds,
    };

    await sqs.sendMessage(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify('Sample message published to SQS queue successfully!'),
    };
  } catch (error) {
    console.error('Error publishing sample message to SQS queue:', error);
    return {
      statusCode: 500,
      body: JSON.stringify('Error publishing sample message to SQS queue. Please try again.'),
    };
  }
};
