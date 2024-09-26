import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { FaHandsHelping, FaUserFriends, FaUsers, FaDollarSign, FaChartPie } from 'react-icons/fa';
import { motion } from 'framer-motion';

const dataCrecimientoProgramas = [
  { name: 'Enero', programas: 4 },
  { name: 'Febrero', programas: 6 },
  { name: 'Marzo', programas: 8 },
  { name: 'Abril', programas: 10 },
  { name: 'Mayo', programas: 15 },
  { name: 'Junio', programas: 20 },
];

const dataCategoriasProgramas = [
  { name: 'Monetaria', value: 12 },
  { name: 'Educación', value: 8 },
];

const dataDonacionesTotales = [
  { name: 'Enero', donaciones: 5000 },
  { name: 'Febrero', donaciones: 7000 },
  { name: 'Marzo', donaciones: 9000 },
  { name: 'Abril', donaciones: 12000 },
  { name: 'Mayo', donaciones: 15000 },
  { name: 'Junio', donaciones: 20000 },
];

const COLORS = ['#0088FE', '#00C49F'];

const ReportesProgramasAyuda = () => {
  const [totalProgramas, setTotalProgramas] = useState(20); // Programas activos
  const [beneficiariosTotales, setBeneficiariosTotales] = useState(150); // Beneficiarios
  const [voluntariosTotales, setVoluntariosTotales] = useState(45); // Voluntarios

  useEffect(() => {
    // Aquí podrías hacer un fetch para obtener los datos reales de tu backend
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-10">
      {/* Resumen rápido - Total de programas, beneficiarios, voluntarios */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#1e293b', color: '#fff' }}>
            <CardContent>
              <div className="flex items-center">
                <FaHandsHelping className="text-blue-500 mr-2" size={40} />
                <div>
                  <Typography variant="h4">{totalProgramas}</Typography>
                  <Typography variant="subtitle1">Programas Activos</Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#1e293b', color: '#fff' }}>
            <CardContent>
              <div className="flex items-center">
                <FaUserFriends className="text-green-500 mr-2" size={40} />
                <div>
                  <Typography variant="h4">{beneficiariosTotales}</Typography>
                  <Typography variant="subtitle1">Beneficiarios Totales</Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#1e293b', color: '#fff' }}>
            <CardContent>
              <div className="flex items-center">
                <FaUsers className="text-purple-500 mr-2" size={40} />
                <div>
                  <Typography variant="h4">{voluntariosTotales}</Typography>
                  <Typography variant="subtitle1">Voluntarios Totales</Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Gráfica de línea - Crecimiento de programas */}
        <motion.div
          className="bg-gray-800 p-6 rounded-lg shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center mb-4">
            <FaDollarSign className="text-blue-500 mr-2" size={24} />
            <Typography variant="h6" color="white" gutterBottom>
              Crecimiento de Programas a lo largo del tiempo
            </Typography>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataCrecimientoProgramas}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#FFFFFF" />
              <YAxis stroke="#FFFFFF" />
              <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '10px' }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="programas"
                stroke="#FFBB28"
                activeDot={{ r: 8 }}
                strokeWidth={3}
                dot={{ stroke: '#FF8042', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Gráfica de pastel - Distribución por tipo de programa */}
        <motion.div
          className="bg-gray-800 p-6 rounded-lg shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center mb-4">
            <FaChartPie className="text-green-500 mr-2" size={24} />
            <Typography variant="h6" color="white" gutterBottom>
              Proporción de Programas por Tipo
            </Typography>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataCategoriasProgramas}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {dataCategoriasProgramas.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Gráfica de línea más grande - Total de donaciones recaudadas */}
      <motion.div
        className="bg-gray-800 p-8 rounded-lg shadow-lg mt-10 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center mb-4">
          <FaDollarSign className="text-yellow-500 mr-2" size={24} />
          <Typography variant="h6" color="white" gutterBottom>
            Total de Donaciones Recaudadas por los Programas
          </Typography>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dataDonacionesTotales}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="name" stroke="#FFFFFF" />
            <YAxis stroke="#FFFFFF" />
            <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '10px' }} />
            <Legend />
            <Line
              type="monotone"
              dataKey="donaciones"
              stroke="#00C49F"
              activeDot={{ r: 8 }}
              strokeWidth={4}
              dot={{ stroke: '#FF8042', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default ReportesProgramasAyuda;
