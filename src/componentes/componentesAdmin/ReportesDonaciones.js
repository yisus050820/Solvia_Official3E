import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, Typography, Grid, Button, Snackbar } from '@mui/material';
import { FaDollarSign, FaMoneyBillWave, FaChartPie } from 'react-icons/fa';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ReportesDonaciones = () => {
  const [totalDonaciones, setTotalDonaciones] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [promedioPorUsuario, setPromedioPorUsuario] = useState(0);
  const [donacionesPorDonante, setDonacionesPorDonante] = useState([]);
  const [evolucionDonaciones, setEvolucionDonaciones] = useState([]);
  const pdfRef = useRef();
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se encontró el token.');
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        const totalDonacionesRes = await axios.get('http://localhost:5000/donationsReports/totalDonaciones');
        setTotalDonaciones(totalDonacionesRes.data);

        const totalGastosRes = await axios.get('http://localhost:5000/donationsReports/totalGastos');
        setTotalGastos(totalGastosRes.data);

        const donacionesPorDonanteRes = await axios.get('http://localhost:5000/donationsReports/distribucionDonaciones');
        setDonacionesPorDonante(donacionesPorDonanteRes.data);

        const totalUsuarios = donacionesPorDonanteRes.data.length;
        const totalDonaciones = donacionesPorDonanteRes.data.reduce((acc, donor) => acc + donor.total_donations, 0);
        setPromedioPorUsuario(totalDonaciones / totalUsuarios);

        const evolucionRes = await axios.get('http://localhost:5000/donationsReports/evolucionDonaciones');
        console.log('Datos de la evolucion;', evolucionRes.data)
        setEvolucionDonaciones(evolucionRes.data);
      } catch (error) {
        console.error('Error fetching donation data:', error);
        setError('Hubo un error al obtener los datos de donaciones.');
        setSnackbarOpen(true);
      }
    };

    fetchData();

    // Actualizar los mensajes cada 5 segundos
    const intervalId = setInterval(fetchData, 1000);

    // Limpiar el intervalo al desmontar el componente
    return () => clearInterval(intervalId);
  }, []);

  const exportarPDF = () => {
    const input = pdfRef.current;
  
    if (input) {
      html2canvas(input, {
        scale: 3, // Mejora la calidad de la captura
        useCORS: true,
        allowTaint: true,
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape'); // Orientación horizontal
  
        // Calcula el ancho y alto de la página en el PDF
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;
  
        // Calcula las dimensiones de la imagen para mantener la proporción y llenar la página
        const imgAspectRatio = canvas.width / canvas.height;
        const pageAspectRatio = pageWidth / pageHeight;
  
        let imgWidth, imgHeight, xPos, yPos;
  
        // Ajusta la imagen según la proporción de aspecto de la página y de la imagen
        if (imgAspectRatio > pageAspectRatio) {
          imgWidth = pageWidth;
          imgHeight = pageWidth / imgAspectRatio;
          xPos = 0;
          yPos = (pageHeight - imgHeight) / 2; // Centra verticalmente
        } else {
          imgHeight = pageHeight;
          imgWidth = pageHeight * imgAspectRatio;
          yPos = 0;
          xPos = (pageWidth - imgWidth) / 2; // Centra horizontalmente
        }
  
        pdf.addImage(imgData, 'PNG', xPos, yPos, imgWidth, imgHeight); // Añade la imagen ajustada y centrada
        pdf.save('reporteDonaciones.pdf');
      }).catch((error) => {
        console.error('Error capturing the image:', error);
      });
    } else {
      console.error('Elemento no encontrado para la exportación de PDF');
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto mt-2">
      <Typography variant="h3" align="center" color="primary" gutterBottom>
        Reporte Donaciones
      </Typography>

      {error && (
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={error}
        />
      )}

      {/* Envolver todas las gráficas y el contenido de texto en el ref pdfRef */}
      <div ref={pdfRef}>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
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
            {evolucionDonaciones.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={evolucionDonaciones}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="month" stroke="#FFFFFF" />
                  <YAxis stroke="#FFFFFF" />
                  <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '10px' }} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Donaciones"  // Asegúrate de que coincida con la clave exacta en los datos de evolución
                    stroke="#FFBB28"
                    activeDot={{ r: 8 }}
                    strokeWidth={3}
                    dot={{ stroke: '#FF8042', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="white">Cargando datos de evolucion...</Typography>
            )}
          </motion.div>

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
                  label={({ donor_name, total_donations }) => `${donor_name}: ${total_donations}`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="total_donations"
                >
                  {donacionesPorDonante.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, entry) => {
                    const { donor_name } = entry.payload;
                    return [`${value}`, `${donor_name} `];
                  }}
                  contentStyle={{ backgroundColor: 'white', borderRadius: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <Button variant="contained" color="primary" onClick={exportarPDF}>
          Exportar a PDF
        </Button>
      </div>
    </div>
  );
};

export default ReportesDonaciones;
