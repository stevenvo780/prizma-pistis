import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ClientService } from './client.service';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { User } from '../user/entities/user.entity';
import { Subscription } from '../user/entities/subscription.entity';

describe('ClientService', () => {
  let service: ClientService;
  let repo: Partial<Repository<Client>>;
  let subRepo: Partial<Repository<Subscription>>;
  const user: User = { id: 'u1' } as any;

  // Mock del EntityManager usado dentro de manager.transaction(...).
  let manager: { findOne: jest.Mock; save: jest.Mock };

  beforeEach(() => {
    manager = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    repo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      // manager.transaction ejecuta el callback con el manager mockeado.
      manager: {
        transaction: jest.fn((cb: any) => cb(manager)),
      },
    } as any;
    subRepo = { findOne: jest.fn() } as any;
    service = new ClientService(repo as Repository<Client>, subRepo as Repository<Subscription>);
  });

  it('creates a client', async () => {
    (repo.findOne as jest.Mock).mockResolvedValue(null);
    (repo.create as jest.Mock).mockImplementation((data) => data);
    (repo.save as jest.Mock).mockImplementation(async (c) => c);
    const dto = { document: '123' } as any;
    const result = await service.create(dto, user);
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.document).toBe('123');
    expect(result.user).toBe(user);
  });

  it('throws conflict if document exists', async () => {
    (repo.findOne as jest.Mock).mockResolvedValue({ id: 1 } as Client);
    await expect(service.create({ document: '123' } as any, user)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('checkSufficientCredits returns false when balance low', async () => {
    (repo.findOne as jest.Mock).mockResolvedValue({ current_balance: 5 } as Client);
    const result = await service.checkSufficientCredits(1, 10);
    expect(result).toBe(false);
  });

  it('updateCredits subtracts on expense (dentro de transacción con lock)', async () => {
    const client = { id: 1, current_balance: 20, credit_limit: 30 } as Client;
    manager.findOne.mockResolvedValue(client);
    manager.save.mockImplementation(async (_entity, c) => c);
    const result = await service.updateCredits(1, 10, 'expense');
    expect(manager.findOne).toHaveBeenCalledWith(
      Client,
      expect.objectContaining({ lock: { mode: 'pessimistic_write' } }),
    );
    expect(result.current_balance).toBe(10);
  });

  it('updateCredits lanza si no hay saldo suficiente en expense', async () => {
    const client = { id: 1, current_balance: 5, credit_limit: 30 } as Client;
    manager.findOne.mockResolvedValue(client);
    await expect(service.updateCredits(1, 10, 'expense')).rejects.toBeDefined();
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('updateCredits NO sube credit_limit al recibir income', async () => {
    const client = { id: 1, current_balance: 20, credit_limit: 30 } as Client;
    manager.findOne.mockResolvedValue(client);
    manager.save.mockImplementation(async (_entity, c) => c);
    const result = await service.updateCredits(1, 50, 'income');
    expect(result.current_balance).toBe(70);
    expect(result.credit_limit).toBe(30);
  });
});
