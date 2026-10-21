const express = require('express');

const app = express();
const PORT = 3000;

// Permite recibir datos en formato JSON
app.use(express.json());

// Tareas iniciales
let tareas = [
    {
        id: 1,
        titulo: 'Estudiar Express',
        descripcion: 'Aprender a crear rutas para una API',
        estado: 'pendiente',
        pasos: [
            'Crear el proyecto',
            'Configurar Express',
            'Probar las rutas en Postman'
        ]
    },
    {
        id: 2,
        titulo: 'Hacer el taller de programación',
        descripcion: 'Completar los ejercicios de Node.js',
        estado: 'completada',
        pasos: [
            'Leer las instrucciones',
            'Escribir el código',
            'Probar el resultado'
        ]
    },
    {
        id: 3,
        titulo: 'Repasar JavaScript',
        descripcion: 'Practicar arreglos y objetos',
        estado: 'pendiente',
        pasos: [
            'Repasar variables',
            'Practicar arreglos',
            'Resolver ejercicios'
        ]
    }
];

// Generar un ID nuevo sin repetir los existentes
function generarId() {
    return tareas.length === 0
        ? 1
        : Math.max(...tareas.map(tarea => tarea.id)) + 1;
}

// Validar que el ID sea un número entero positivo
function validarId(id) {
    return /^\d+$/.test(id) && Number(id) > 0;
}

// Validar los datos de una tarea
function validarTarea(titulo, descripcion, estado, pasos) {
    return (
        typeof titulo === 'string' &&
        titulo.trim() !== '' &&
        typeof descripcion === 'string' &&
        descripcion.trim() !== '' &&
        ['pendiente', 'completada'].includes(estado) &&
        Array.isArray(pasos) &&
        pasos.every(
            paso => typeof paso === 'string' && paso.trim() !== ''
        )
    );
}

// 1. GET /tareas
// Obtener todas las tareas
app.get('/tareas', (req, res) => {
    res.status(200).json(tareas);
});

// 2. GET /tareas/nombre/:titulo
// Obtener una tarea por su título
app.get('/tareas/nombre/:titulo', (req, res) => {
    const titulo = req.params.titulo.trim().toLowerCase();

    const tarea = tareas.find(
        tarea => tarea.titulo.toLowerCase() === titulo
    );

    if (!tarea) {
        return res.status(404).json({
            mensaje: 'No se encontró una tarea con ese título.'
        });
    }

    res.status(200).json(tarea);
});

// 3. GET /tareas/pendientes
// Obtener todas las tareas pendientes
app.get('/tareas/pendientes', (req, res) => {
    const pendientes = tareas.filter(
        tarea => tarea.estado === 'pendiente'
    );

    res.status(200).json(pendientes);
});

// 4. GET /tareas/completadas
// Obtener todas las tareas completadas
app.get('/tareas/completadas', (req, res) => {
    const completadas = tareas.filter(
        tarea => tarea.estado === 'completada'
    );

    res.status(200).json(completadas);
});

// 5. POST /tareas
// Agregar una nueva tarea
app.post('/tareas', (req, res) => {
    const { titulo, descripcion, estado, pasos } = req.body;

    if (!validarTarea(titulo, descripcion, estado, pasos)) {
        return res.status(400).json({
            mensaje: 'Datos inválidos. Revisa el título, la descripción, el estado y los pasos.'
        });
    }

    const nuevaTarea = {
        id: generarId(),
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        estado: estado,
        pasos: pasos.map(paso => paso.trim())
    };

    tareas.push(nuevaTarea);

    res.status(201).json({
        mensaje: 'Tarea creada correctamente.',
        tarea: nuevaTarea
    });
});

// 6. PUT /tareas/:id
// Actualizar todos los datos de una tarea
app.put('/tareas/:id', (req, res) => {
    if (!validarId(req.params.id)) {
        return res.status(400).json({
            mensaje: 'El ID debe ser un número entero positivo.'
        });
    }

    const id = Number(req.params.id);

    const tarea = tareas.find(
        tarea => tarea.id === id
    );

    if (!tarea) {
        return res.status(404).json({
            mensaje: 'Tarea no encontrada.'
        });
    }

    const { titulo, descripcion, estado, pasos } = req.body;

    if (!validarTarea(titulo, descripcion, estado, pasos)) {
        return res.status(400).json({
            mensaje: 'Datos inválidos. Revisa el título, la descripción, el estado y los pasos.'
        });
    }

    tarea.titulo = titulo.trim();
    tarea.descripcion = descripcion.trim();
    tarea.estado = estado;
    tarea.pasos = pasos.map(paso => paso.trim());

    res.status(200).json({
        mensaje: 'Tarea actualizada correctamente.',
        tarea: tarea
    });
});

// 7. PATCH /tareas/:id/estado
// Actualizar únicamente el estado de una tarea
app.patch('/tareas/:id/estado', (req, res) => {
    if (!validarId(req.params.id)) {
        return res.status(400).json({
            mensaje: 'El ID debe ser un número entero positivo.'
        });
    }

    const id = Number(req.params.id);

    const tarea = tareas.find(
        tarea => tarea.id === id
    );

    if (!tarea) {
        return res.status(404).json({
            mensaje: 'Tarea no encontrada.'
        });
    }

    const { estado } = req.body;

    if (!['pendiente', 'completada'].includes(estado)) {
        return res.status(400).json({
            mensaje: 'El estado debe ser pendiente o completada.'
        });
    }

    tarea.estado = estado;

    res.status(200).json({
        mensaje: 'Estado actualizado correctamente.',
        tarea: tarea
    });
});

// 8. DELETE /tareas/:id
// Eliminar una tarea específica
app.delete('/tareas/:id', (req, res) => {
    if (!validarId(req.params.id)) {
        return res.status(400).json({
            mensaje: 'El ID debe ser un número entero positivo.'
        });
    }

    const id = Number(req.params.id);

    const indice = tareas.findIndex(
        tarea => tarea.id === id
    );

    if (indice === -1) {
        return res.status(404).json({
            mensaje: 'Tarea no encontrada.'
        });
    }

    const tareaEliminada = tareas.splice(indice, 1)[0];

    res.status(200).json({
        mensaje: 'Tarea eliminada correctamente.',
        tarea: tareaEliminada
    });
});

// Manejo de rutas inexistentes
// Siempre debe ir después de todas las rutas
app.use((req, res) => {
    res.status(404).json({
        mensaje: `No existe la ruta ${req.method} ${req.url}`
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`API de tareas funcionando en http://localhost:${PORT}`);
});