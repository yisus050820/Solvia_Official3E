import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { FaDollarSign, FaMoneyBillWave, FaChartPie } from 'react-icons/fa';
import { motion } from 'framer-motion';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ReportesDonaciones = () => {
  const [totalDonaciones, setTotalDonaciones] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0); 
  const [promedioPorUsuario, setPromedioPorUsuario] = useState(0);
  const [donacionesPorDonante, setDonacionesPorDonante] = useState([]);
  const [evolucionDonaciones, setEvolucionDonaciones] = useState([]); // Nueva variable para la evolución de donaciones

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener total de donaciones
        const totalDonacionesRes = await axios.get('http://localhost:5000/donationsReports/totalDonaciones');
        setTotalDonaciones(totalDonacionesRes.data);
  
        // Obtener total de gastos
        const totalGastosRes = await axios.get('http://localhost:5000/donationsReports/totalGastos');
        setTotalGastos(totalGastosRes.data);
  
        // Obtener distribución de donaciones por donante
        const donacionesPorDonanteRes = await axios.get('http://localhost:5000/donationsReports/distribucionDonaciones');
        setDonacionesPorDonante(donacionesPorDonanteRes.data);
  
        // Calcular promedio de donaciones por usuario
        const totalUsuarios = donacionesPorDonanteRes.data.length;
        const totalDonaciones = donacionesPorDonanteRes.data.reduce((acc, donor) => acc + donor.total_donations, 0);
        setPromedioPorUsuario(totalDonaciones / totalUsuarios);

        // Obtener evolución de donaciones
        const evolucionRes = await axios.get('http://localhost:5000/donationsReports/evolucionDonaciones');
        setEvolucionDonaciones(evolucionRes.data); // Aquí se setean los datos de evolución

      } catch (error) {
        console.error('Error fetching donation data:', error);
      }
    };
  
    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-10">
      {/* Resumen rápido - Total de donaciones, nuevas donaciones, promedio por usuario */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#1e293b', color: '#fff' }}>
            <CardContent>
              <div className="flex items-center">
                <FaDollarSign className="text-green-500 mr-2" size={40} />
                <div>
                  <Typography variant="h4">${totalDonaciones}</Typography>
                  <Typography variant="subtitle1">Total de Donaciones</Typography>
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
                  <Typography variant="h4">${totalGastos}</Typography>
                  <Typography variant="subtitle1">Total de Gastos</Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#1e293b', color: '#fff' }}>
            <CardContent>
              <div className="flex items-center">
                <FaChartPie className="text-purple-500 mr-2" size={40} />
                <div>
                  <Typography variant="h4">${promedioPorUsuario.toFixed(2)}</Typography>
                  <Typography variant="subtitle1">Promedio de Donaciones por Usuario</Typography>
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
            <LineChart data={evolucionDonaciones}> 
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="month" stroke="#FFFFFF" /> 
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

        {/* Gráfica de pastel - Distribución de Donaciones por Donante */}
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
              Distribución de Donaciones por Donante
            </Typography>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={donacionesPorDonante}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ donor_name, total_donations }) =>
                  `${donor_name}: ${((total_donations / totalDonaciones) * 100).toFixed(2)}%`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="total_donations"
              >
                {donacionesPorDonante.map((entry, index) => (
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

export default ReportesDonaciones;
