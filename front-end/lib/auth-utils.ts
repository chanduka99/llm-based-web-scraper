import clientPromise from './mongodb'
import bcryptjs from 'bcryptjs'
import { ObjectId } from 'mongodb'

export interface User {
    _id: ObjectId
    email: string
    password?: string
    name?: string
    image?: string
    emailVerified?: Date
    createdAt: Date
}

export async function getUser(email: string): Promise<User | null> {
    const client = await clientPromise
    const db = client.db('nextauth')

    const user = await db.collection('users').findOne({ email })
    return user as User | null
}

export async function getUserById(id: string): Promise<User | null> {
    const client = await clientPromise
    const db = client.db('nextauth')

    const user = await db.collection('users').findOne({ _id: new ObjectId(id) })
    return user as User | null
}

export async function createUser(
    email: string,
    password: string,
    name?: string
): Promise<User> {
    const client = await clientPromise
    const db = client.db('nextauth')

    // Check if user already exists
    const existingUser = await getUser(email)
    if (existingUser) {
        throw new Error('User already exists')
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10)

    const result = await db.collection('users').insertOne({
        email,
        password: hashedPassword,
        name: name || '',
        image: null,
        emailVerified: null,
        createdAt: new Date(),
    })

    return {
        _id: result.insertedId,
        email,
        name: name || '',
        createdAt: new Date(),
    }
}

export async function updateUser(
    id: string,
    updates: Partial<Omit<User, '_id'>>
): Promise<User | null> {
    const client = await clientPromise
    const db = client.db('nextauth')

    const result = await db.collection('users').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updates },
        { returnDocument: 'after' }
    )

    return result?.value as User | null
}
