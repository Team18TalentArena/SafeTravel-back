import { Injectable } from '@nestjs/common';
import { Prisma, User, UserType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { createCipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}
    

    async create(data: Prisma.UserCreateInput): Promise<User> {
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email: data.email,
                user_type: UserType.USER,
            },
        });

        if (existingUser) {
            throw new Error(`User with email ${data.email} already exists as a ${data.user_type}`);
        }

        // Hash the password before storing it
        const hashedPassword = await this.hash_password(data.password_hash);

        const createdUser = await this.prisma.user.create({
            data: {
                email: data.email,
                username: data.username,
                password_hash: hashedPassword,
                phone: data.phone,
                user_type: data.user_type,
            }
        });
        return createdUser;
    }

    async update(id: bigint, data: Prisma.UserUpdateInput): Promise<User> {
        // If password is being updated, hash it first
        if (data.password_hash) {
            data.password_hash = await this.hash_password(data.password_hash as string);
        }
        
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }


    async findOneById(id: bigint): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: {
                id,
            },
        });
    }

    async findAll(): Promise<User[]> {
        return this.prisma.user.findMany();
    }


    async hash_password(password: string): Promise<string> {
        // Generate a random salt
        const salt = randomBytes(16).toString('hex');
        
        // Hash the password with the salt
        const derivedKey = await promisify(scrypt)(password, salt, 32) as Buffer;
        
        // Return the salt and hashed password together
        return `${salt}:${derivedKey.toString('hex')}`;
    }
    
    async verify_password(storedPassword: string, suppliedPassword: string): Promise<boolean> {
        // Split the stored password into salt and hash
        const [salt, storedHash] = storedPassword.split(':');
        
        // Hash the supplied password with the same salt
        const derivedKey = await promisify(scrypt)(suppliedPassword, salt, 32) as Buffer;
        
        // Compare the hashes
        return storedHash === derivedKey.toString('hex');
    }
}