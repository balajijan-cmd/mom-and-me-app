const API_URL = 'http://localhost:5000/api';

async function createFirstAdmin() {
    console.log('========================================');
    console.log('  Creating First Admin User');
    console.log('========================================\n');

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'Admin@123',
                fullName: 'Administrator'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✓ Admin user created successfully!\n');
            console.log('Login Credentials:');
            console.log('  Username: admin');
            console.log('  Password: Admin@123\n');
            console.log('⚠️  Please change the password after first login!\n');
        } else {
            if (data.message && data.message.includes('already exists')) {
                console.log('ℹ️  Admin user already exists!\n');
                console.log('Login Credentials (if you haven\'t changed them):');
                console.log('  Username: admin');
                console.log('  Password: Admin@123\n');
            } else {
                console.log(`❌ Error: ${data.message || response.statusText}`);
            }
        }
        console.log('You can now login at: http://localhost:5173\n');

    } catch (error) {
        if (error.cause && error.cause.code === 'ECONNREFUSED') {
            console.log('❌ Error: Backend server is not running!');
            console.log('Please start the backend first:');
            console.log('  cd backend');
            console.log('  npm start\n');
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

createFirstAdmin();
