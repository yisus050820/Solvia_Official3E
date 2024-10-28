import React, { useState } from 'react';
import {
  Card, CardContent, Typography, Grid, TextField, Button, RadioGroup, FormControlLabel, Radio, Snackbar, Alert
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import jsPDF from 'jspdf';

const stripePromise = loadStripe('pk_test_wk6O7Cc5k3McBIG2Hut2irGs');

const Donar = () => {
  const [cantidad, setCantidad] = useState('');
  const [step, setStep] = useState(1);
  const [metodoPago, setMetodoPago] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    pais: '',
  });
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

  const stripe = useStripe();
  const elements = useElements();

  // Función para cerrar el Snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Función para validar el formulario
  const validateForm = () => {
    const { nombre, direccion, ciudad, codigoPostal, pais } = formData;

    if (!nombre || !direccion || !ciudad || !codigoPostal || !pais || !cantidad || !metodoPago) {
      setMessage('Por favor, complete todos los campos.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return false;
    }

    if (isNaN(cantidad) || cantidad <= 0) {
      setMessage('Por favor, ingrese una cantidad válida.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return false;
    }

    return true;
  };

  // Función para generar el PDF de la donación con el formato exacto
  const generarFacturaPDF = () => {
    const { nombre, direccion, ciudad, codigoPostal, pais } = formData;
    const subtotal = Number(cantidad);
    const iva = subtotal * 0.16; // IVA del 16%
    const total = subtotal + iva;

    const doc = new jsPDF();

    // Encabezado del recibo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Comprobante de donación', 20, 20);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Número de orden: #1234567', 20, 30);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 20, 36);

    // Línea de separación
    doc.line(20, 40, 190, 40);

    // Información del cliente y vendedor
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Cliente', 20, 50);
    doc.text('Nosotros', 130, 50);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    // Información del cliente
    doc.text(`${nombre}`, 20, 58);
    doc.text(`${direccion}`, 20, 64);
    doc.text(`${ciudad}, ${codigoPostal}`, 20, 70);

    // Información del vendedor
    doc.text('SOLVIA ONG', 130, 58);
    doc.text('Manzanillo, Col. El naranjo', 130, 64);
    doc.text('solviacorp@gmail.com', 130, 70);

    // Línea de separación para la tabla
    doc.line(20, 80, 190, 80);

    // Tabla de descripción, cantidad y precio
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Descripción', 25, 88);
    doc.text('Cantidad', 100, 88);
    doc.text('Precio', 160, 88);

    // Valores de la tabla
    doc.setFont('helvetica', 'normal');
    doc.text('Donación para Solvia', 25, 96);
    doc.text('1', 110, 96);
    doc.text(`${Number(cantidad).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`, 160, 96);

    // Línea de separación debajo de la tabla
    doc.line(20, 102, 190, 102);

    // Totales: Subtotal, IVA y Total
    doc.setFontSize(12);
    doc.text(`Subtotal: ${subtotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`, 140, 110);
    doc.text(`IVA (16%): ${iva.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`, 140, 116);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`, 140, 122);

    // Firma simulada y agradecimiento
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(20, 150, 80, 150); // Línea de firma
    doc.setFont('helvetica', 'normal');
    doc.text('Firma', 20, 160);

    doc.setFontSize(16);
    doc.setTextColor(255, 165, 0);
    doc.text('¡Gracias!', 160, 160);

    // Guardar el documento
    doc.save('Comprobante_Donacion.pdf');
  };

  // Función para manejar el envío del pago
  const handleDonar = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.error(error);
      setMessage('Error procesando el pago.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } else {
      console.log('Pago exitoso!', paymentMethod);
      generarFacturaPDF();
      setSuccessMessage('Donación hecha exitosamente.');

      setTimeout(() => {
        setSuccessMessage('');
        setStep(1);
      }, 2000);
    }
  };

  return (
    <motion.div className="max-w-6xl mx-auto mt-2">
      <Typography variant="h3" align="center" color="primary" gutterBottom>
        Donar
      </Typography>

      <Card sx={{ backgroundColor: '#1e293b', color: '#fff', padding: '20px', borderRadius: '15px' }}>
        <CardContent>
          {step === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h4" color="white" gutterBottom>
                  Selecciona el método de pago
                </Typography>
                <RadioGroup value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                  <FormControlLabel value="credito" control={<Radio />} label="Tarjeta de Crédito" />
                  <FormControlLabel value="debito" control={<Radio />} label="Tarjeta de Débito" />
                </RadioGroup>
                <TextField
                  fullWidth
                  label="Cantidad a Donar (MXN)"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  type="number"
                  sx={{
                    backgroundColor: '#fff',
                    borderRadius: '5px',
                    '& .MuiInputBase-input': { color: 'black' }, // Texto ingresado en negro
                    '& .MuiInputLabel-root': { color: 'black' }, // Etiqueta en negro
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#000', // Color del borde
                      },
                      '&:hover fieldset': {
                        borderColor: '#000', // Borde al hacer hover
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#000', // Borde cuando está enfocado
                      },
                    },
                    '& .MuiInputBase-input::placeholder': { color: 'black' }, // Placeholder en negro
                    marginTop: '20px',
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setStep(2)}
                  disabled={!metodoPago || !cantidad}
                  sx={{ mt: 2 }}
                >
                  Siguiente
                </Button>
              </Grid>
            </Grid>
          )}

          {step === 2 && (
            <form onSubmit={handleDonar}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h4" color="white" gutterBottom>
                    Ingresa los datos de tu tarjeta
                  </Typography>

                  <CardElement
                    options={{
                      style: {
                        base: {
                          color: '#fff',
                          fontSize: '16px',
                          '::placeholder': { color: '#87bbfd' },
                        },
                        invalid: { color: '#ff6b6b' },
                      },
                    }}
                  />

                  {/* Campo de nombre del titular */}
                  <TextField
                    fullWidth
                    label="Nombre del Titular"
                    name="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    sx={{
                      backgroundColor: '#fff',
                      borderRadius: '5px',
                      marginTop: '20px',
                      '& .MuiInputBase-input': { color: 'black' }, // Texto ingresado en negro
                      '& .MuiInputLabel-root': { color: 'black' }, // Etiqueta en negro
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#000', // Color del borde
                        },
                        '&:hover fieldset': {
                          borderColor: '#000', // Borde al hacer hover
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#000', // Borde cuando está enfocado
                        },
                      },
                      '& .MuiInputBase-input::placeholder': { color: 'black' }, // Placeholder en negro
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Dirección"
                    name="direccion"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    sx={{
                      backgroundColor: '#fff',
                      borderRadius: '5px',
                      marginTop: '20px',
                      '& .MuiInputBase-input': { color: 'black' }, // Texto ingresado en negro
                      '& .MuiInputLabel-root': { color: 'black' }, // Etiqueta en negro
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#000', // Color del borde
                        },
                        '&:hover fieldset': {
                          borderColor: '#000', // Borde al hacer hover
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#000', // Borde cuando está enfocado
                        },
                      },
                      '& .MuiInputBase-input::placeholder': { color: 'black' }, // Placeholder en negro
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Ciudad"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    sx={{
                      backgroundColor: '#fff',
                      borderRadius: '5px',
                      marginTop: '20px',
                      '& .MuiInputBase-input': { color: 'black' }, // Texto ingresado en negro
                      '& .MuiInputLabel-root': { color: 'black' }, // Etiqueta en negro
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#000', // Color del borde
                        },
                        '&:hover fieldset': {
                          borderColor: '#000', // Borde al hacer hover
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#000', // Borde cuando está enfocado
                        },
                      },
                      '& .MuiInputBase-input::placeholder': { color: 'black' }, // Placeholder en negro
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Código Postal"
                    name="codigoPostal"
                    value={formData.codigoPostal}
                    onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                    sx={{
                      backgroundColor: '#fff',
                      borderRadius: '5px',
                      marginTop: '20px',
                      '& .MuiInputBase-input': { color: 'black' }, // Texto ingresado en negro
                      '& .MuiInputLabel-root': { color: 'black' }, // Etiqueta en negro
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#000', // Color del borde
                        },
                        '&:hover fieldset': {
                          borderColor: '#000', // Borde al hacer hover
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#000', // Borde cuando está enfocado
                        },
                      },
                      '& .MuiInputBase-input::placeholder': { color: 'black' }, // Placeholder en negro
                    }}
                  />
                  <TextField
                    fullWidth
                    label="País"
                    name="pais"
                    value={formData.pais}
                    onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                    sx={{
                      backgroundColor: '#fff',
                      borderRadius: '5px',
                      marginTop: '20px',
                      '& .MuiInputBase-input': { color: 'black' }, // Texto ingresado en negro
                      '& .MuiInputLabel-root': { color: 'black' }, // Etiqueta en negro
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#000', // Color del borde
                        },
                        '&:hover fieldset': {
                          borderColor: '#000', // Borde al hacer hover
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#000', // Borde cuando está enfocado
                        },
                      },
                      '& .MuiInputBase-input::placeholder': { color: 'black' }, // Placeholder en negro
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    disabled={!stripe}
                  >
                    Pagar
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: 'easeIn' }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              className="bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              <h2 className="text-white text-2xl font-bold mb-4">{successMessage}</h2>
              <motion.div
                className="flex justify-center items-center"
                style={{
                  borderRadius: '50%',
                  backgroundColor: '#4CAF50',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <FaCheck size={50} className="text-white" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Snackbar para mostrar mensajes de error */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

const DonarConStripe = () => {
  return (
    <Elements stripe={stripePromise}>
      <Donar />
    </Elements>
  );
};

export default DonarConStripe;
