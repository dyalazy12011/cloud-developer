import { TodoAccess } from './todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'

export class TodoService {

    public constructor(
        private readonly todoAccess: TodoAccess = new TodoAccess(),
    ) { }

    public async getTodosForUser(userId: string): Promise<TodoItem[]> {
        return this.todoAccess.getAllTodos(userId);
    }

    public async createTodo(
        createTodoRequest: CreateTodoRequest,
        userId: string
    ): Promise<TodoItem> {
        const itemId = uuid.v4()
        return this.todoAccess.createTodo({
            todoId: itemId,
            userId: userId,
            name: createTodoRequest.name,
            dueDate: createTodoRequest.dueDate,
            createdAt: new Date().toISOString(),
            done: false,
            attachmentUrl: `https://${process.env.ATTACHMENT_S3_BUCKET}.s3.amazonaws.com/${itemId}`,
        })
    }

    public async updateTodo(
        todoId: string,
        userId: string,
        updateTodoRequest: UpdateTodoRequest
    ): Promise<void> {
        await this.todoAccess.updateTodo(todoId, userId, {
            name: updateTodoRequest.name,
            dueDate: updateTodoRequest.dueDate,
            done: updateTodoRequest.done
        })
    }

    public async getTodo(
        todoId: string, userId: string
    ): Promise<TodoItem> {
        return this.todoAccess.getATodo(todoId, userId)
    }

    public async deleteTodo(
        todoId: string, userId: string
    ): Promise<void> {
        await this.todoAccess.deleteTodo(todoId, userId)
    }

}
