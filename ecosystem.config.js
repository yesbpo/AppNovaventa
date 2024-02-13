module.exports = {
    apps: [{
        name: 'AppNovaventa',
        script: 'node_modules/next/dist/bin/next',
        args: 'start',
        cwd: '/root/novaventa/AppNovaventa', // Ruta
        env: {
            NODE_ENV: 'production',
            NEXTAUTH_SECRET: '8be770c42c83bf70a62f1597e5e3f888964b60d59d012af3b1c7575730a59be1',
            NEXT_PUBLIC_BASE_URL: 'https://front.appcenteryes.com',
            NEXT_PUBLIC_NAMEAPP: 'NOVAVENTA2024',
            NEXT_PUBLIC_CELLPHONE: '573204573737',
            NEXT_PUBLIC_SOCKET: 'https://back.appcenteryes.com:3050/socket.io',
            NEXT_PUBLIC_BASE_API: 'https://back.appcenteryes.com:8080/w',
            NEXT_PUBLIC_API2: 'https://back.appcenteryes.com:3040/sa',
            NEXT_PUBLIC_BASE_DB: 'https://back.appcenteryes.com:3013/dbn',
            NEXT_PUBLIC_APPID: '522e21b6-d83f-486c-ba0e-872180219095',
            NEXT_PUBLIC_PARTNERAPPTOKEN: 'sk_3cf52c6b3c5d408b742d46c6ab3845d',
            NEXT_PUBLIC_URL_GUPSHUP: 'https://api.gupshup.io/wa/api/v1/template/msg',
            DATABASE_URL: 'mysql://yesdbadmin:qBABt797iNHu9Zx@yesappcenterdb.mysql.database.azure.com:3306/dbappnovaventa',
            NEXTAUTH_URL: 'http://localhost:3000/auth/login',
            TEMPLATE_SEND: 'https://api.gupshup.io/wa/api/v1/template/msg'
        }
    }],
}