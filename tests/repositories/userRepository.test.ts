import { Collection, ObjectId } from 'mongodb';
import { z } from 'zod';
import UserRepository from '../../src/repositories/userRepository';
import { IMongoDBClient } from '../../src/config/mongoDB.config';
import { databasePOSTUserInterface, databasePUTUserInterface } from '../../src/interfaces/databaseUserInterfaces';
import {describe, expect, beforeEach, jest, it } from '@jest/globals';

// Mock the MongoDB client and collection
jest.mock('mongodb');

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockCollection: jest.Mocked<Collection>;
  let mockDb: jest.Mocked<IMongoDBClient>;

  beforeEach(() => {
    mockCollection = {
      insertOne: jest.fn(),
      findOne: jest.fn(),
      deleteOne: jest.fn(),
      updateOne: jest.fn(),
    } as unknown as jest.Mocked<Collection>;

    mockDb = {
      getCollection: jest.fn().mockReturnValue(mockCollection),
    } as unknown as jest.Mocked<IMongoDBClient>;

    userRepository = new UserRepository(mockDb);
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const mockUser: databasePOSTUserInterface = {
        authId: 'someAuthId',
        email: 'test@example.com',
        bornDate: '2000-01-01',
        firstName: 'Test',
        lastName: 'User',
      };

      const mockObjectId = new ObjectId();
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true ,insertedId: mockObjectId });

      const result = await userRepository.createUser(mockUser);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ acknowledged: true ,insertedId: mockObjectId });
    });

    it('should throw an error if user data is invalid', async () => {
      const invalidUser = {
        email: 'invalid-email',
        password: 'short',
      };

      await expect(userRepository.createUser(invalidUser as any)).rejects.toThrow(z.ZodError);
    });
  });

  describe('getUserByEmail', () => {
    it('should retrieve a user by email', async () => {
      const mockUser = {
        email: 'test@example.com',
        name: 'Test User',
      };

      mockCollection.findOne.mockResolvedValue(mockUser);

      const result = await userRepository.getUserByEmail('test@example.com');

      expect(mockCollection.findOne).toHaveBeenCalledWith({ validatedEmail: 'test@example.com' });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const result = await userRepository.getUserByEmail('nonexistent@example.com');

      expect(mockCollection.findOne).toHaveBeenCalledWith({ validatedEmail: 'nonexistent@example.com' });
      expect(result).toBeNull();
    });

    it('should throw an error if email is invalid', async () => {
      await expect(userRepository.getUserByEmail('invalid-email')).rejects.toThrow(z.ZodError);
    });
  });


  describe('deleteUserByEmail', () => {
    it('should delete a user by email', async () => {
      mockCollection.deleteOne.mockResolvedValue({ acknowledged: true , deletedCount: 1 });

      const result = await userRepository.deleteUserByEmail('test@example.com');

      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ validatedEmail: 'test@example.com' });
      expect(result).toEqual({ acknowledged: true ,deletedCount: 1 });
    });

    it('should throw an error if email is invalid', async () => {
      await expect(userRepository.deleteUserByEmail('invalid-email')).rejects.toThrow(z.ZodError);
    });
  });

  describe('updateUserByEmail', () => {
    it('should update a user by email', async () => {
      const mockUpdate: databasePUTUserInterface = {
        firstName: 'Updated Name',
      };

      mockCollection.updateOne.mockResolvedValue({ acknowledged: true, matchedCount:1 , modifiedCount: 1, upsertedCount: 0, upsertedId: null });

      const result = await userRepository.updateUserByEmail('test@example.com', mockUpdate);

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { email: 'test@example.com' },
        { $set: mockUpdate }
      );
      expect(result).toEqual({ acknowledged: true, matchedCount:1 , modifiedCount: 1, upsertedCount: 0, upsertedId: null });
    });

    it('should throw an error if email is invalid', async () => {
      await expect(userRepository.updateUserByEmail('invalid-email', { firstName: 'Test' })).rejects.toThrow(z.ZodError);
    });

    it('should throw an error if update data is invalid', async () => {
      const invalidUpdate = {
        invalidField: 'some value',
      };

      await expect(userRepository.updateUserByEmail('test@example.com', invalidUpdate as any)).rejects.toThrow(Error("No valid fields to update"));
    });
  });

});