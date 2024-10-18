import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { FaUsers, FaUserPlus, FaUserShield, FaUserFriends } from 'react-icons/fa';
import { motion } from 'framer-motion';

const dataUsuarios = [
{ name: 'Enero', usuarios: 40 },
{ name: 'Febrero', usuarios: 45 },
{ name: 'Marzo', usuarios: 50 },
{ name: 'Abril', usuarios: 60 },
{ name: 'Mayo', usuarios: 70 },
{ name: 'Junio', usuarios: 85 },
];

const dataRoles = [
{ name: 'Admin', value: 3 },
{ name: 'Coordinador', value: 5 },
{ name: 'Voluntario', value: 7 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ReportesUsuarios = () => {
  // Simulación de datos para las tarjetas
const [totalUsuarios, setTotalUsuarios] = useState(120);
const [nuevosUsuarios, setNuevosUsuarios] = useState(15); // Nuevos usuarios en la última semana
const [usuariosPorRoles, setUsuariosPorRoles] = useState({
    admin: 3,
    coordinadores: 10,
    voluntarios: 7,
});

return (
    <div className="max-w-6xl mx-auto mt-10">
      {/* Resumen rápido - Total de usuarios, nuevos usuarios, usuarios por rol */}
    <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
        <Card sx={{ backgroundColor: '#1e293b', color: '#fff' }}>
            <CardContent>
            <div className="flex items-center">
                <FaUsers className="text-blue-500 mr-2" size={40} />
                <div>
                <Typography variant="h4">{totalUsuarios}</Typography>
                <Typography variant="subtitle1">Total de Usuarios Registrados</Typography>
                </div>
            </div>
            </CardContent>
        </Card>
        </Grid>

        <Grid item xs={12} md={4}>
        <Card sx={{ backgroundColor: '#1e293b', color: '#fff' }}>
            <CardContent>
            <div className="flex items-center">
                <FaUserPlus className="text-green-500 mr-2" size={40} />
                <div>
                <Typography variant="h4">{nuevosUsuarios}</Typography>
                <Typography variant="subtitle1">Nuevos Usuarios (Última Semana)</Typography>
                </div>
            </div>
            </CardContent>
        </Card>
        </Grid>

        <Grid item xs={12} md={4}>
        <Card sx={{ backgroundColor: '#1e293b', color: '#fff' }}>
            <CardContent>
            <div className="flex items-center">
                <FaUserFriends className="text-purple-500 mr-2" size={40} />
                <div>
                <Typography variant="h4">{usuariosPorRoles.coordinadores}</Typography>
                <Typography variant="subtitle1">Coordinadores</Typography>
                </div>
            </div>
            </CardContent>
        </Card>
        </Grid>
    </Grid>

      {/* Gráficas existentes */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Gráfica de línea - Crecimiento de usuarios */}
        <motion.div
        className="bg-gray-800 p-6 rounded-lg shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
        >
        <div className="flex items-center mb-4">
            <FaUsers className="text-blue-500 mr-2" size={24} />
            <Typography variant="h6" color="white" gutterBottom>
            Crecimiento de Usuarios a lo largo del tiempo
            </Typography>
        </div>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataUsuarios}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="name" stroke="#FFFFFF" />
            <YAxis stroke="#FFFFFF" />
            <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '10px' }} />
            <Legend />
            <Line
                type="monotone"
                dataKey="usuarios"
                stroke="#FFBB28"
                activeDot={{ r: 8 }}
                strokeWidth={3}
                dot={{ stroke: '#FF8042', strokeWidth: 2 }}
            />
            </LineChart>
        </ResponsiveContainer>
        </motion.div>

        {/* Gráfica de pastel - Distribución de roles */}
        <motion.div
        className="bg-gray-800 p-6 rounded-lg shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
        >
        <div className="flex items-center mb-4">
            <FaUserFriends className="text-green-500 mr-2" size={24} />
            <Typography variant="h6" color="white" gutterBottom>
            Distribución de Usuarios por Rol
            </Typography>
        </div>
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
            <Pie
                data={dataRoles}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
        >
                {dataRoles.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '10px' }} />
            </PieChart>
        </ResponsiveContainer>
        </motion.div>
    </div>
    </div>
);
};

export default ReportesUsuarios;
