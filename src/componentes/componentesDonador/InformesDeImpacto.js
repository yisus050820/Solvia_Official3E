import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { FaDollarSign, FaHandHoldingUsd, FaChartPie, FaMoneyBillWave } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { MoneyOff } from '@mui/icons-material';

const dataDonaciones = [
  { name: 'Enero', donaciones: 400 },
  { name: 'Febrero', donaciones: 500 },
  { name: 'Marzo', donaciones: 700 },
  { name: 'Abril', donaciones: 850 },
  { name: 'Mayo', donaciones: 950 },
  { name: 'Junio', donaciones: 1200 },
];

const dataTiposDonaciones = [
  { name: 'Monetarias', value: 65 },
  { name: 'En especie', value: 35 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const InformesDeImpacto = () => {
  // Simulación de datos para las tarjetas
  const [totalProgramasFondeados, setTotalProgramasFondeados] = useState(10); // Número total de programas fondeados
  const [totalUsuariosBeneficiados, setTotalUsuariosBeneficiados] = useState(500); // Número total de usuarios beneficiados

  useEffect(() => {
    // Aquí podrías hacer un fetch para obtener los datos reales de tu backend
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-2">
    <Typography variant="h3" align="center" color="primary" gutterBottom>
      Impacto
    </Typography>
      {/* Resumen rápido - Total de programas fondeados, usuarios beneficiados */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#1e293b', color: '#fff' }}>
            <CardContent>
              <div className="flex items-center">
                <FaDollarSign className="text-green-500 mr-2" size={40} />
                <div>
                  <Typography variant="h4">{totalProgramasFondeados}</Typography>
                  <Typography variant="subtitle1">Programas Fondeados</Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#1e293b', color: '#fff' }}>
            <CardContent>
              <div className="flex items-center">
                <FaMoneyBillWave className="text-blue-500 mr-2" size={40} />
                <div>
                  <Typography variant="h4">{totalUsuariosBeneficiados}</Typography>
                  <Typography variant="subtitle1">Usuarios Beneficiados</Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Gráfica de línea - Evolución de donaciones */}
        <motion.div
          className="bg-gray-800 p-6 rounded-lg shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center mb-4">
            <FaDollarSign className="text-green-500 mr-2" size={24} />
            <Typography variant="h6" color="white" gutterBottom>
              Evolución de Donaciones a lo largo del tiempo
            </Typography>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataDonaciones}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#FFFFFF" />
              <YAxis stroke="#FFFFFF" />
              <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '10px' }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="donaciones"
                stroke="#FFBB28"
                activeDot={{ r: 8 }}
                strokeWidth={3}
                dot={{ stroke: '#FF8042', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Gráfica de pastel - Distribución por tipo de donación */}
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
              Distribución de Donaciones por Tipo
            </Typography>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataTiposDonaciones}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {dataTiposDonaciones.map((entry, index) => (
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

export default InformesDeImpacto;
