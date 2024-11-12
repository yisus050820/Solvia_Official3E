import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { FaUsers, FaUserPlus, FaUserFriends } from 'react-icons/fa';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ReportesUsuarios = () => {
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [nuevosUsuarios, setNuevosUsuarios] = useState(0);
  const [usuariosPorRoles, setUsuariosPorRoles] = useState([]);
  const [crecimientoUsuarios, setCrecimientoUsuarios] = useState([]);
  const [coordinadores, setCoordinadores] = useState(0);
  const pdfRef = useRef(); // Ref para el PDF

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener total de usuarios
        const totalUsuariosRes = await axios.get('http://localhost:5000/userReports/totalUsuarios');
        setTotalUsuarios(totalUsuariosRes.data.total);  // Asegúrate de que "total" sea la clave correcta

        // Obtener crecimiento de usuarios a lo largo del tiempo
        const crecimientoUsuariosRes = await axios.get('http://localhost:5000/userReports/crecimientoUsuarios');
        console.log('Datos de crecimiento de usuarios:', crecimientoUsuariosRes.data);
        setCrecimientoUsuarios(crecimientoUsuariosRes.data);

        // Obtener distribución por roles
        const rolesRes = await axios.get('http://localhost:5000/userReports/usuariosPorRoles');
        setUsuariosPorRoles(rolesRes.data);

        // Extraer la cantidad de coordinadores
        const coordinadores = rolesRes.data.find(role => role.name === 'coordinator')?.value || 0;
        setCoordinadores(coordinadores);

        // Obtener nuevos usuarios en la última semana
        const nuevosUsuariosRes = await axios.get('http://localhost:5000/userReports/nuevosUsuarios');
        setNuevosUsuarios(nuevosUsuariosRes.data);

      } catch (error) {
        console.error('Error al obtener datos de usuarios:', error);
      }
    };

    fetchData();
  }, []);

  const formatMonth = (monthString) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const [year, month] = monthString.split("-");
    return `${months[parseInt(month, 10) - 1]} ${year}`;
  };

  const exportarPDF = () => {
    const input = pdfRef.current;

    if (input) {
      html2canvas(input, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgWidth = 190;
        const pageHeight = pdf.internal.pageSize.height;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        pdf.save('reporteUsuarios.pdf');
      }).catch((error) => {
        console.error('Error capturing the image:', error);
      });
    } else {
      console.error('Element not found for PDF export');
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-2" ref={pdfRef}>
      {/* Título encima del contenido */}
      <Typography variant="h3" align="center" color="primary" gutterBottom>
        Reporte Usuarios
      </Typography>
      {/* Resumen rápido - Total de usuarios, nuevos usuarios, usuarios por rol */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#1e293b', color: '#fff' }}>
            <CardContent>
              <div className="flex items-center">
                <FaUsers className="text-blue-500 mr-2" size={40} />
                <div>
                  <Typography variant="h4">{totalUsuarios || 0}</Typography>  {/* Muestra totalUsuarios */}
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
                  <Typography variant="subtitle1">Nuevos Usuarios</Typography>
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
                  <Typography variant="h4">{coordinadores || 0}</Typography>  {/* Muestra coordinadores */}
                  <Typography variant="subtitle1">Coordinadores</Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficas */}
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
          {crecimientoUsuarios.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={crecimientoUsuarios}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="month" stroke="#FFFFFF" tickFormatter={formatMonth} />
                <YAxis stroke="#FFFFFF" />
                <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '10px' }} />
                <Legend /><Line
                  type="monotone"
                  dataKey="usuarios"
                  stroke="#FFBB28"
                  activeDot={{ r: 8 }}
                  strokeWidth={3}
                  dot={{ stroke: '#FF8042', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Typography color="white">Cargando datos de crecimiento...</Typography>
          )}
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
                data={usuariosPorRoles}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => totalUsuarios > 0 ? `${name}: ${(value / totalUsuarios * 100).toFixed(2)}%` : `${name}: 0%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {usuariosPorRoles.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Botón para exportar en PDF */}
      <div className="flex justify-center mt-8">
        <button
          className="bg-blue-500 text-white py-2 px-6 rounded-lg shadow-lg hover:bg-blue-600"
          onClick={exportarPDF}
        >
          Exportar en PDF
        </button>
      </div>
    </div>
  );
};

export default ReportesUsuarios;
