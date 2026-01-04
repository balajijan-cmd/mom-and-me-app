
const { db } = require('./backend/config/firebase');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
    try {
        const username = 'admin';
        const password = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            username,
            password: hashedPassword,
            fullName: 'Admin User',
            role: 'admin',
            isActive: true,
            createdAt: new Date().toISOString()
        };

        const usersRef = db.collection('users');

        // Check if exists first
        const snapshot = await usersRef.where('username', '==', username).get();
        if (!snapshot.empty) {
            console.log('User already exists. Updating password...');
            const docId = snapshot.docs[0].id;
            await usersRef.doc(docId).update({ password: hashedPassword });
            console.log(`Password updated for user: ${username}`);
        } else {
            await usersRef.add(newUser);
            console.log(`Admin user created: ${username}`);
        }

        console.log(`Credentials: ${username} / ${password}`);
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
