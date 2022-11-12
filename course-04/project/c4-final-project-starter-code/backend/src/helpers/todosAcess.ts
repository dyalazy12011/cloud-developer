import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import * as DynamoDB from 'aws-sdk/clients/dynamodb';

// const XAWS = AWSXRay.captureAWS(AWS);

function createDocumentClient(): DynamoDB.DocumentClient {
    return new DynamoDB.DocumentClient();;
}

const logger = createLogger('TodosAccess')

export class TodoAccess {
    public constructor(
        private readonly documentClient: DynamoDB.DocumentClient = createDocumentClient(),
    ) { }
    
    public async createTodo(todo: TodoItem): Promise<TodoItem> {
        const res = await this.documentClient
            .put({
                TableName: process.env.TODOS_TABLE,
                Item: todo,
            })
            .promise();

        logger.info(res);
        return todo;
    }

    public async updateTodo(
        todoId: string,
        userId: string,
        todo: TodoUpdate,
    ): Promise<void> {
        const res = await this.documentClient
            .update({
                TableName: process.env.TODOS_TABLE,
                Key: {
                    todoId,
                    userId
                },
                UpdateExpression:
                    'set #n = :name, done = :done, dueDate = :dueDate',
                ExpressionAttributeValues: {
                    ':name': todo.name,
                    ':done': todo.done,
                    ':dueDate': todo.dueDate,
                },
                ExpressionAttributeNames: {
                    '#n': 'name',
                },
                ReturnValues: 'UPDATED_NEW',
            })
            .promise();
        logger.info(res);
    }

    public async getAllTodos(userId: string): Promise<TodoItem[]> {
        const result = await this.documentClient
            .query({
                TableName: process.env.TODOS_TABLE,
                IndexName: process.env.TODOS_USER_ID_INDEX,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId,
                }
            })
            .promise();
        
        const res = result.Items;
        logger.info(res);
        return res as TodoItem[];
    }

    public async getATodo(todoId: string, userId: string): Promise<TodoItem> {
        const result = await this.documentClient
            .query({
                TableName: process.env.TODOS_TABLE,
                IndexName: process.env.TODOS_USER_ID_INDEX,
                KeyConditionExpression: 'todoId = :todoId and userId = :userId',
                ExpressionAttributeValues: {
                    ':todoId': todoId,
                    ':userId': userId,
                },
            })
            .promise();

        if (result.Count == 0) {
            return undefined
        }
        const item = result.Items[0];
        return item as TodoItem;
    }

    public async deleteTodo(todoId: string, userId: string): Promise<void> {
        const res = await this.documentClient
            .delete({
                TableName: process.env.TODOS_TABLE,
                Key: {
                    todoId,
                    userId
                },
            })
            .promise();
        logger.info(res);
    }

}
