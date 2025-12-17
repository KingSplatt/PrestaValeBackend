# Pasos iniciales: 
## Creacion de la base de datos prestavale
Creacion de la BD, se encuentra el archivo en prisma/db.sql, este archivo se ejecuta en pgmyAdmin

# Configuracion de .env
Configurar la variable de entorno DATABASE_URL en el archivo .env con la cadena de conexion a la base de datos PostgreSQL. Ejemplo:
```
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/nombre_basedatos"
```

## Agregar el schema a prisma
Para que prisma detecte la base de datos, ejecutar el siguiente comando:
```
    npx prisma db pull
```
Esto actualizara el archivo schema.prisma con las tablas y relaciones de la base de datos.

- Puedes ver el schema o el diagrama con el comando:
```
    npx prisma studio
```

## Generar el cliente de Prisma
Despues de actualizar el schema, generar el cliente de Prisma con el siguiente comando:
```
    npx prisma generate
```
Esto creara el cliente de Prisma que se utilizara en la aplicacion para interactuar con la base de datos. la identifiara como objetos y sus relaciones.


