// Реализация HTTP клиента
import { IHttpClient } from '../interfaces/api.interfaces';

export class HttpClient implements IHttpClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(url: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error('GET request failed:', error);
      throw error;
    }
  }

  async post<T>(url: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error('POST request failed:', error);
      throw error;
    }
  }

  async put<T>(url: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error('PUT request failed:', error);
      throw error;
    }
  }

  async delete<T>(url: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error('DELETE request failed:', error);
      throw error;
    }
  }
}
