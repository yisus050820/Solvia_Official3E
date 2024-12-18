import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TextField, Button, Snackbar, Alert
} from '@mui/material';
import { ArrowLeft, CreditCard, DollarSign } from "lucide-react";
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';

export default function Donar() {
  const [donationAmount, setDonationAmount] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    card: '',
    name: '',
    country: 'mx',
    postalCode: '',
  });
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [orderNumber, setOrderNumber] = useState(1);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) {
      value = value.slice(0, 3);
    }
    setFormData({
      ...formData,
      cvv: value
    });

    if (value.length !== 3) {
      setErrors({
        ...errors,
        cvv: 'El CVV debe tener 3 dígitos'
      });
    } else {
      const { cvv, ...rest } = errors;
      setErrors(rest);
    }
  };


  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setErrors(prev => ({
        ...prev,
        email: 'El email es requerido'
      }));
      return false;
    } else if (!emailRegex.test(email)) {
      setErrors(prev => ({
        ...prev,
        email: 'Por favor ingrese un email válido'
      }));
      return false;
    } else {
      setErrors(prev => {
        const { email, ...rest } = prev;
        return rest;
      });
      return true;
    }
  };



  const validateName = (name) => {
    const nameRegex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]{2,50}$/;
    if (!nameRegex.test(name)) {
      setErrors({
        ...errors,
        name: 'El nombre debe contener solo letras y espacios (2-50 caracteres)'
      });
      return false;
    }
    const { name: nameError, ...rest } = errors;
    setErrors(rest);
    return true;
  };

  //Aniamcion de exito al actualizar datos de perfil
  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        setSuccessMessage('');
      }, 1000); // El mensaje desaparecerá después de 1 segundos, se mide en ms
    }
  }, [successMessage]);

  const handleCardExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length > 4) {
      value = value.slice(0, 4);
    }

    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }

    setFormData({
      ...formData,
      cardExpiry: value
    });
  };

  const validateCardExpiry = () => {
    const value = formData.cardExpiry;
    if (!value) {
      setErrors({
        ...errors,
        cardExpiry: 'La fecha de vencimiento es requerida'
      });
      return false;
    }

    const [month, year] = value.split('/');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = parseInt(currentDate.getFullYear().toString().slice(-2));
    const inputMonth = parseInt(month);
    const inputYear = parseInt(year);

    if (!month || !year || inputMonth < 1 || inputMonth > 12) {
      setErrors({
        ...errors,
        cardExpiry: 'Mes inválido'
      });
      return false;
    }

    if (inputYear < currentYear || (inputYear === currentYear && inputMonth < currentMonth)) {
      setErrors({
        ...errors,
        cardExpiry: 'La tarjeta ha expirado'
      });
      return false;
    }

    const { cardExpiry, ...rest } = errors;
    setErrors(rest);
    return true;
  };


  
  // Validate postal code based on country
  const validatePostalCode = (code, country) => {
    const postalCodeRegex = {
      es: /^(?:0[1-9]|[1-4]\d|5[0-2])\d{3}$/, // Spain: 5 digits
      mx: /^\d{5}$/, // Mexico: 5 digits
      ar: /^[A-Z]\d{4}[A-Z]{3}$/, // Argentina: Letter + 4 digits + 3 letters
      co: /^\d{6}$/ // Colombia: 6 digits
    };

    if (!postalCodeRegex[country].test(code)) {
      setErrors({
        ...errors,
        postalCode: 'Código postal no válido para el país seleccionado'
      });
      return false;
    }
    const { postalCode: postalError, ...rest } = errors;
    setErrors(rest);
    return true;
  };

  const handlePostalCodeChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      postalCode: value
    }));
    validatePostalCode(value, formData.country);
  };

  const handleCardChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remueve caracteres que no sean números
    
    if (value.length > 16) {
      value = value.slice(0, 16); // Limita a 16 caracteres
    }

    setFormData({
      ...formData,
      card: value
    });

    // Validación de longitud de la tarjeta
    if (value.length < 16) {
      setErrors({
        ...errors,
        card: 'El número de tarjeta debe tener exactamente 16 dígitos'
      });
    } else {
      const { card, ...rest } = errors; // Elimina el error si la longitud es correcta
      setErrors(rest);
    }
  };
  const validateAmount = (amount) => {
    const numAmount = parseFloat(amount);
    if (!amount) {
      setErrors(prev => ({
        ...prev,
        amount: 'La cantidad es requerida'
      }));
      return false;
    } else if (isNaN(numAmount) || numAmount <= 0) {
      setErrors(prev => ({
        ...prev,
        amount: 'La cantidad debe ser mayor a 0'
      }));
      return false;
    } else {
      setErrors(prev => {
        const { amount, ...rest } = prev;
        return rest;
      });
      return true;
    }
  };


  const handleDonationChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setDonationAmount(value);
    validateAmount(value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'email') {
      validateEmail(value);
    }
  };

  

  const generarFacturaPDF = () => {
    const { email, card, name, country, postalCode } = formData
    const subtotal = Number(donationAmount)
    const iva = subtotal * 0.16 // IVA del 16%
    const total = subtotal + iva

   

    if (!donationAmount || !email || !card || !name || !postalCode) {
      setMessage('Por favor complete todos los campos.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
    setMessage('');

    const doc = new jsPDF()

    // Agregar imagen (por ejemplo, logo)
    const logoUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAArUAAAKvCAYAAAB07Te8AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAKk0SURBVHhe7f0HvB3Vee//P6cf9d4rQvSOGl2AqJJAotngFjshsRPHvsn93dT7i+P8Xzc3du69/5uYZscx4G7TRe9dQkJ0CdQbEhJNvZ7+e77P7HW0EUc6AglxRufzFos9e+8pa9bMPvPMmjVrSsaMGdN0yw3XGQAAAJBXpYVXAAAAILdKm5qaCoMAAABAPlFTCwAAgNwrLSkpKQwCAAAA+URNLQAAAHIvej+4+UZ6PwAAAEB+UVMLAACA3CttbGwsDAIAAAD5RE0tAAAAcq9k9OjRTbfeeH3hLQAAAJA/pa4wCAAAAORTaUNDQ2EQAAAAyCeqaQEAAJB7PFEMAAAAuUdNLQAAAHKPoBYAAAC5V9rU1FQYBAAAAPKptKysrDAIAAAA5BM1tQAAAMi90sbGxsIgAAAAkE906QUAAIDco/cDAAAA5F7J6NGjm2656frCWwAAACB/aH4AAACA3KP3AwAAAOQeNbUAAADIvZJRo0Y1/fymGwpvAQAAgPwpdYVBAAAAIJ9ofgAAAIDc40YxAAAA5B5BLQAAAHKPBrUAAADIPWpqAQAAkHv0fgAAAIDco6YWAAAAuUdNLQAAAHKPmloAAADkHkEtAAAAco/mBwAAAMi9kpNPPrnp5z+5sfAWAAAAyB9qagEAAJB7pSUlJYVBAAAAIJ9KGxsbC4MAAABAPtH2AAAAALlXMnr06KZbb7y+8BYAAADIH/qpBQAAQO7R/AAAAAC5R5deAAAAyD0iWgAAAOQebWoBAACQezx8AQAAALlHm1oAAADkHs0PAAAAkHs8JhcAAAC5R5taAAAA5B4NagEAAJB7BLUAAADIvZJRo0Y13frjGwpvAQAAgPyhSy8AAADkHr0fAAAAIPfopxYAAAC5VzJ69OimW2+8vvAWAAAAyB/6qQUAAEDuEdQCAAAg9whqAQAAkHv05wUAAIDcI6gFAABA7pU2NDQUBgEAAIB8oqYWAAAAucdjcgEAAJB7PFEMAAAAuUeXXgAAAMg92h4AAAAg92h+AAAAgNwrGTt2bNPPbvhR4S0AAACQPzQ/AAAAQO7R/AAAAAC5R+8HAAAAyL3SxsbGwiAAAACQT3Gj2M3Xc6MYAAAA8osbxQAAAJB73CgGAACA3KOmFgAAALlX6gqDAAAAQD4R0QIAACD36NILAAAAucfDFwAAAJB7ND8AAABA7hHUAgAAIPcIagEAAJB7BLUAAADIPYJaAAAA5F7JmDFjmm6+8brCWwAAACB/qKkFAABA7hHUAgAAIPcIagEAAJB7JWPHjm26+fofFd4CAAAA+VPa2NhYGAQAAADyqbSsrKwwCAAAAORTaX19fWEQAAAAyKfSkpKSwiAAAACQTwS1AAAAyL3SpqamwiAAAACQT6WuMAgAAADkE116AQAAIPeopgUAAEDu0fwAAAAAuUdECwAAgNyj9wMAAADkXsno0aObbrnp+sJbAAAAIH9Ky8rKCoMAAABAPtH8AAAAALlHUAsAAIDco0svAAAA5F7J2LFjm26+/keFtwAAAED+lJaUlBQGAQAAgHyiTS0AAAByj6AWAAAAucddYgAAAMg9gloAAADkHjeKAQAAIPeoqQUAAEDuUVMLAACA3CttbGwsDAIAAAD5RE0tAAAAco82tQAAAMg9Hr4AAACA3CsZM2ZM0803Xld4CwAAAOQPbWoBAACQewS1AAAAyD269AIAAEDulYwePbrp1huvL7wFAAAA8ofmBwAAAMi9UlcYBAAAAPKJNrUAAADIPappAQAAkHu0qQUAAEDu0fwAAAAAuVdaVlZWGAQAAADyqbShoaEwCAAAAOQTbWoBAACQe/RTCwAAgNwrbWpqKgwCAAAA+UTzAwAAAOReydixY5t+dsOPCm8BAACA/KFBLQAAAHKPoBYAAAC5R+8HAAAAyD0iWgAAAORe3Ch28/XcKAYAAID8oqYWAAAAuUc/tQAAAMi90sbGxsIgAAAAkE88JhcAAAC5R/MDAAAA5B43igEAACD3CGoBAACQezQ/AAAAQO7R+wEAAAByj5paAAAA5B5BLQAAAHKPfmoBAACQeyVjxoxpuvnG6wpvAQAAgPyhphYAAAC5R5taAAAA5B5BLQAAAHIv2tTecgNtagEAAJBftKkFAABA7tH8AAAAALlHUAsAAIDco/kBAAAAco+aWgAAAOQeNbUAAADIvdLCKwAAAJBbpY2NjYVBAAAAIJ9oUwsAAIDco/kBAAAAcq/UFQYBAACAfCKiBQAAQO6VjB07tulnN/yo8BYAAADIH/qpBQAAQO7R/AAAAAC5x41iAAAAyL2Sk08+uekXP76x8BYAAADIHx6+AAAAgNwjqAUAAEDu0fsBAAAAco+7xAAAAJB79H4AAACA3CttbGwsDAIAAAD5xI1iAAAAyD2aHwAAACD3aH4AAACA3KP5AQAAAHKPtgcAAADIPR6+AAAAgNwrGTNmTNPNN15XeAsAAADkD80PAAAAkHt06QUAAIDco0svAAAA5B5BLQAAAHKvZNSoUU0/v+mGwlsAAAAgf3j4AgAAAHKPG8UAAACQe0S0AAAAyL3ShoaGwiAAAACQTzQ/AAAAQO6VNjU1FQaBPNKNjvuaAABA3lFNCwAAgNyjSy8AAADkHkEtAAAAco/eDwAAAJB79H4AAACA3KP5AQAAAHKvZMyYMU0333hd4S2QN/vjpIxu7QAAyDvaHgAAACD3CGqRW42NTabmMxUVFZYeIlJfXx/DqVmNboQsfsCIPldqbGyM72h+AwDAwYGgFrlVWlpiNTU1tm3bNuvUqVMEtJWVlRGoKpBV4FpWVlYYOwto9ZnG0w2S5eXlVltbW/gWAADkWcno0aObbr3x+sJbID8aowa2JAJUtYttqG+wyqoqD1RrrKGh0aqrq6M2ts4DV9XmVum9B7Q7duywMg9o9ZmC4vIyzu0AAMg7jubIrTIPZis8OFUDgvq6+ghSt2zebBvWb7BHHn7Y1q1dG9+ptlY1twpoRTW0/kG8Ly+qyQUAAPlFl17ILe27qolVcwIFqnpdvWa13XzLz+z3v7/Npk2bZu+88058p6QaWtXMKshV7a6aHhS3twUAAPlFTS1yTUGpAlSlJUuW2L3T7rU77rjT5i9caHfcdbc98uijtnLlygiAFdhqfA1nTRaywBgAAOQfQS1yKwWndXV1tmLFCrvvvvts2j33WKdOne3kk0+2HTU19vDDD9vDjzxiy5Yti/HVzjaaIjQ0RI2tmiwAAID8Kxs4cOD3p06aWHgL5IeCVAW0S5YutXvuvtsefPAB6969u51yyin2J9dea02NDTZvwUJbtWqV1dfXWc+ePSNJarKgwLbRxwMAAPlWNmTIkO9PmXhx4S3QtihwVTdcqpEtbv+aBbRZG9qHHnnEfve731vXbt1szOgx9t2//As79JARdvSxx9ia1att3sKFtnLlqrgprF//fta5c+fmZgh1HuzqgWKpOUJqzuBLaF5e+g4AALRdZQMGDKCmFp8DtWXdfUrxa0VFpW3fvt06duwYN3mVlJRGLavGWfPuu3bvA/d7etA6delil1462b7y1a9YvwH9rb6hwRqbGu2QQw6xHTu22YIlS2zZ8uVRMzt02FCr6pA1Q1Cqr6uL+ethDvX1DdEkQQFvupFMecgC3JbzevAmAADyI4LayyZPKrwFDpQ9B02qHVVg+f7779vIkSNt7dq1EWx28eBV7WIXLlpkP/npT+32O+6KBy9MOOdsmzJ1ih3q40YvBx6QdvZxO3XuFNOrr9o333rLXnntNdu6bUu0uW3yLHTt3s3KPVBONcJKCmAV/OpBDlnzhMZCrgAAQFtVNnjwYGpq8TlovSZQgW3Xrl1ty5YtUWuq96qtXbNmjf3+tt/bE08/bf0H9LfLL59qV1xxhQ0dOjTa2GpcBaJ6VbvZXr16me/ntu7DD23u3Ddt5ap3bP26dXb66afH/KyhMQJhqaqqigBXga1eRfNKwwAAoG0qGzRoEEEtPgd7DhIVRCqIVWCqQFU3gCm4Vb+zP/vZz+yxJ5+yPn1626SJF9uFF14QAa0el6txVZur4FQUkCpgVfOCww87LJodzJ8/z1Z5YPv2ihV2mH/Wu1fvGFc9IiiYVSCs5auZgz7TMEEtAABtG80P8DnZc5Co4DJrO5sFuApKP/jgA7vxJz+x55+fbt27dbWJF19k559/vvX24DbVrGZtYxujBjZ116VmBJpXhw4d7JDhw63aA96XXnrZVq1eYzu2bY1gt3uP7lZaVuoBcPZwhorKCp9no9U3KqgtNSv1/CrLu0l6AQAAnx9qavE52XMYqABVNbUKTBVkLl682H7yk/+wmTNfsM6dOntAe7FdePGFNnjIECsrL49pNK5qWXVjWXZTWUlMK5qXKOjt27dvDC9dutSWLF1uW7dsitraPn36xPgKkCUFygp2W0NQCwDA56tk9OjRTbfcdH3hLXCgtBLU6p8HlKphfffdd+2GG2+0WbNmWscOHeyyyy63884/z/r172+l5WURyCpoVVMB1dJqWEnDmj4Ft/pM7xXw6ga0Rx55xKZNu9fqGxrtYp/flClTbMSIETG+mjFofM1bNK/2p9AFBQAAOZA9fGEyNbU40PYc1KqWVIHl6tWr46awBx551Pr07mWXXjrFLrzwwrjxSzW0jT6exk01sgpaFYiq1lbtcfWq+YiaISg4VdLNY/369bPGhnpbuGChrXh7lQfFdTZg4ADr1LFTzLO4ba1eAQBA20VQi8+F2qmmS/2qEVXQqOFUI6rX5StW2O133mUPPfSQdevWzS664AK7/PLLrH//fjGOgtqS0qwrLk2v+WgeqolNAWxqT6vv0zL0qoBVXYEN6N/f35vNefPNeFBDzY4d0UZXD3Korq6Kbr9qarKeF7SsGFlJy23Ob9u6kUzrKClPyrtSCu41DADAwYbmB/hclJWVR7CpwDYFm0pqQqCgVN12PfTwQ3bzz39lQwcPsnPHn2VXXnml9R8woDAH33k9OGtoyvqVVZCqAHPr1q22ZMmS6AEhNUfYE32/ceNG+/GPf2yLFi2Omt1LLplsp556qvXt09c8V5GfrNZWgWIWEO46X32qJhNtRQps9aogVvlXLxC6WU49RaSa7T2j+QEAID9KRo0a1XTrj28ovAUODAW16qJLtaWKnRoaG6xCgZcHkPPnzbNHHn3UHnnsUauq7mhfvPIKO+ecc2zkoYdG7wQ7anZE8Kn2tHUeGItqZBV8LliwwO648w7bvGmLB811Pl5lKzd6lVh5Rbm9u3q1LVq8xLZu22Hdu3ex4cOGxc1jCgibPJot9aT5KahVhW1tXX0ss6qyIvLQWN+gCLIwz8+X8tWkp6M1ZF2S6Ulp5V5WVV4Wffv2sa997WvWpWvX5prc3SOoBQDkR8mYMWOabrnhusJb4MCora2LByuoZlW1iAoeVZO4aNEiu+++++yxxx+3Tl262uSLL7IvfOELNnDgwGgjq8A1anY1k0ITgAiIPchVrwfTp0+3//kv/9M2bdpmPbt3tUYPWhXU7Umjz6d75062ccvWCAKrK8tt89ZtEdOpCUJjU0k0PVCtp8LAijIPcBt9On9fFoFsVkfbpi7q7xKv1nt5q2nF8GFD7IYbbrSePXsS1AIADiolY8eObbr5+h8V3gIHRlZ7WB5BZKplXbx4id1+++127/3324ABA+yyKZfa1KlTrUePHhH0bt68OasdraqK2lEFmko7PNjV5XQFxc8++6x9/x//McabfMkl0QyhNeUeEIuC4gbdOOaB9fwFi239xk02YvgwO2Xs6GjTq35rle90OV/NJ5T0vkzxn6fWwsQDpbys3DOjJh3Z+xUrVtjjjz8RbYhv/fmtcUJBUAsAOJhQU4vPRV1dfTQ9UCCqG5jUbdcvfvUru/e++23IoEF2yeRJ8ehb9Sm7cuVKG+SfKQjT+Aok9XAEBaP1aoNbl93IpfnMmDHD/umf/ikeqPD3//2/Ry8JewreVPu6ZevW6L9W+VFbWXX39Ytf/MIefuSR+P60006zr//BH9ghhxwSQfimTZui9wQFtqpp1vyjTa1qhNtAHKh1UNtZvepkQevw8ksv2/e+9z3rP6Cf/du//Ts1tQCAg06bumKK9qSp+VG27733nv3nLbfYM88+ayMPGW7nnXtO1NAqyFTglW4mSxSsqQZSAabajSqg1fdpHF1mV02ualcV3KnWdndJeVDArFfVBKsZg5Z77bXX2peuvtoD5QZ7bvoM+6UHuboBTd+pllOBooJo5UGZUc2o2u+2tIwDnURlpLzpVetUUVVpm7dv9zLK+upV/gEAOJgQ1OJzoRvF1q1bZ/Pnz7ff/PY3Nnv2bOvapYtdfPHF9oUvfrG5plEBmWoV1TRAQaekYDi6qPLYTEGtKFArLS3zoK3JtmzZatu2bWsOPHeXFOCtX7/eqqurI3jWNKq1VZOHU087LWqMu3bubC+8+JLdf//99uabb0aeUs2wXjWdlt3S/D+PpPJRcKuaZCUF+43+eUXZzn58i08SAAA4GBDU4nOhoFWPvr35llvsiSee9ICrPPqh1YMVFMQqyFRgpiBTAZiCxxSoaVi9EZSqJ4IyDyr9fVND9lCFKg84q6oqrFzjFMbb9V9p8WvMJwv6qlTLqRpMT3p/6IgR9sUvXGWXTp5sTY0N9sgjj9mvf/lLW7Z0qdUXAloFkJqHglq9toWkwDY161AelTcFs9VVHaymZnt8BgDAwYajGz4F1fLtKWW1p7rUrRgxfd7ggafeqzZ13ry37LbbbrNXXn0t2s1eNjV7Uph6OaioSDWJWTCmG7RiLv5R1vQg65s2AtsmDygbmyKwLfflNdTV+0hNVqng15dV4pOWKODcTdIPoKKsLHoH0HRlPg9fSCTNY9CAAXbeuefalVOnRqD83PQX7De//rWtenul1e2osQ6VVbGcutrayJ9qcaXRg+BUg6sAM9H7zzql5aQgV8PaHg31DX5SkD2UAgCAg01pOggC+4uCWfUnq4BUtaspsFJ7VHXL9dZbb9nNP7vZZr7wQjz69vzzJnhAe4ENGzbUp6mL6crKshpGBbaZFLRlAe3Oz516JPCgWTW3qmFVkKvhGMXHLfHX4qTPm189vlNgbB5w60av5kBYcV+DB7k+5yGDBttFF1xoF51/nlV4cPj008/YHbfdbms/+NC2bt6SBYseqJd5SrWgCuAVPKqZhcogy7sW2ppCxvYhpWC2uEY2glovG51QENQCAA5GpRzg8FlIAZX2rxTU6k589WTw29/+xp55frr17NXLJl50UTxYYciQIVGzmdXMKjjbO1kdcCa9Jru+/7TKPV+DBw2ySRMn2VVXXGGNdfX22ONP2M9v/bktX7YsaolVQ6ugsa5ONbbZY3j1XkGmgloAAPDZ8thjZ20OsD8oqEs3UymoVZCqS/Bz5syxadPusSefftoGDxlsF118kV140YU2bNiwGE9BoAJABbdZQNg2KP9aFz1e9gtXXWVTLr0kel3QQyIefvjh6ANWNdBah/r6hubxVQ5aDwXqAADgs0VQi/1OQZ2CuXQVQDcsLVu2zO6+52677/77rVu3HnblZVNtwrnnxkMWsmCwvvmSuaZXaiuUF+VReVOvCF/+8ldsyuTJ1rtXL3vwoYfigRG66U1UQ5vWJ/UyoIAXAAB8tkp10AX2JwWxab/asmWLLfKAT8GsAkAFtAoILzj/AuvXr1/U4CpoVDdaqt1VEwUFgW3pZCsF2OrpQPlVXr/73e/aWePPUnNee/Dhh5trbBXQpsBWVOss/M4AAPhslXJpFPtbRdHNYUuXLrVf/vKXNu3e+6x3n37R7+uXv/pl696je3THpQBQTwdTENvo42s6fb5XNbUeJ2qslsbci6n3mvKmPOm3ooBWgbe6JPvyl79s55w93jp26mRPPfOM3XX33bZg4cLIe1V1VYyvAF/rqOD2QAe2LZaBslAoNwAADiZ+vPYAQgc5Emk/pcamRqtrqLc35s6x2+643WbOnm29+vW1yZMusi9ec7UHt32swccp82CvQ6eOVuL74Nbt26ymtsYqPRis9oBR37c0748k7cH+GkFaUQqlH/1sX1JpeVkE6lqn9Rs3RJ63bNtqI0Yeatf+8bU28eILTS2AH3/qKbvrnrvtzXlvRd40bW19XUxf39hgvkYfm/dnmT5SLoX8NAe0xd+RSCQSiXQQJLr0wn5XX19v8+bNs7vuvMueeOoZ69a9h/3Bl79k11zzpWhisHXr1qi91KueEqZ9MNVk6rJ9W9sn1T5YD4FQs4j+/fvHOsimTZviUbxXXnmVTbzwgsj3k08/Yw8//Ii9//77sU668U3ja/rUJAEAAOx/3CWGT0R90Ba3d9Xja/X0LwWyou/0KNnbfv97m/7CC/FghSmTJ9p5550XTwpToKfgTpfl0+NcFTQqIExBreZ1oC/Vt0ZBuPKrIFx5U1Letb69e/e2KVOm+HpOigc5THvgAfvRdT+K7stUPhonBcJp2uLAPQW7eugEAAD4dPx4S1yLvadYU0GY2pUq0FPSzVMK+PT5q6++ar/57W/suRdmRjODKy6bYpMmTbLu3bvHeCm4k7YWuLZm12A00ecKbCdNnmxf+MKV1qNbV3tuxkz76U9/GgH7hg0bonxUVimA1+9O5aX3+lzvt2/f+eQxAADwyUTzg12fuEQi7S41NTTGE7yqK6vikbL6TK96PO2c19+wX//yVzb7xZdtyMBBdvmUKXbBeefbgP79rbysPMbV42j1sILieX7qpD3YX5WKPw+ezeLPPuvUsbqDDRs6zM47Z4JdfMGF1qmq0l6cOcv+9Qc/sM2bNsV6N3rZ6VVPPKssr7AKLxPlPZ6A5mvT0nz3JX2kbHwwfZbKrXhcEolEIpHynmhTi09EtYvaZ9SMQLW1qmFUTeMrr7xiv//97+yVV1+zQQMH2qWXqNuu86P5wdYtW62+ri5qaaOWUo+w3R+0E/tLS/W9LX32WdJ6NdTXRxOLSRMn2le//BXTI3+nT3/B/u3//putWrUqgnnV2CpvamIR5eifNXmZqlz3d/ODFstGP/dCuQEAcDChn1p8ItpflBSE6cYpJT0p7He/+63Nmv1SPCnsssum2umnnRY3USnoVQCcpMD2YKMgVevWqVMn69Onj5111lk2depl0WvCM889Hw9o0AMoVHYqDzXFULtiDeszDRNqAgDw6dGgFp9ICsoUrCoQe+utt+xnP7vZA9rZ1q9vP5t08UQ768wzI7BTe1EFv+rTVdPo/cFK5VEcwKvG9rLLLrOpUy61zp072WNPPGF33HFH9AqhctBNZqlNsqZToH8wBvsAABwoND/AJ5TV0qo7Lj1Y4bHHHrMnn3nG+vcfYJMnTbQzzjjdunbtGrWWCmZFtbkKhkWBcBo+mGid1BxDvR0oYFWN7cCBAyOwnTxxolVVV9tjTz5hDz30kC1cuCBqdjWeRDOEOFGgphYAgE+Lmlp8Igre1Oeqejm46667bMbMmTZwwAC7bMoUO7/QhjYFran2UjWTKbBVsJu6/zrYKGBPvRloXfVe/drqyWMXnn+eB7FV9vyM6fbAAw/aggULohxVFjpJUDk16pm7AADgU6FNLT5CFffpErqCLe0fSgq49J1qIxctWmT33X+/Pfr4Y1ZVVW1TLplsF198kQ0cOCDGVb+1Cu5Ua6l56eaorOlBU3OftgfbBQIFpQpmta6ycePGCGq1/kOHDrVLL7nULr7gAi9Hi0fqPhg1tgujba1ovOJgP11BUb/AKtOd5cXvFQCAllBT264oINpzUjBVXq6bufQkLdUglnnAlfWvqiBVbUJ/9/vfx5OzBgwcZF++5ot21VVXWq9evSKwU+Cqu/7L9WjZivIYbmjQpfasf9odO3R5vsIDtXjbRihi3Lek8snWP7tprGPHjtH8Qp/rgQ2DBw+2a6+91i48f4KVV1TYQw8/HE0RVq9e3Rz8ZieYWQCb1dpmJxQKbDPZ+7Stdp8AAGh/CGrxEQqatmzZErWOKSjLLo032ty5c+23v/2dPfPMszbcg7RLJ0200047LR6soOlS29As8MKuVD6TJ18STx7TScCjjz8RvSKsWLEianbVNENJ46nMVfZqoqCgNz297GBtugEAwL4iqEUzBaMKqtREQMGpgim1hdVNYWoDevfdd9szzz5rffv3s4mTLo5Hww4bNiwCXjVLSAFwqrHER+lEYciQIfbVr37NJpxzjjXW19mdd95lP7/l1ij71EWaAte0HfS5ylcoWwAAdq80HTAB1RCmdrRqaqAASsHVG2+8Yb/73e9t5ouzbcShh9pXv/Qlu+iii+ImKAW86SEMaXq94uNU862mCGp3+/Wvf92uvPJK69i5k734yiv27//+7/buu+9GOarpgqTgVsGwTjD0nlpwAABaRrUPPkLBkwLVFJyqDe0dt99hL8ycGX3PXnzhBXb22eOjuyoFWaqdVfdV6eYwTpJ2T2XTuXPn5uYdV199tf3B177mnzfYY08+aTfeeGM0RUh92Go7aBukJgkqb04YAABoGb0foJn2BQWnqlFUjeFLL71k//nTn9rMF1+My+ZXXDbVzj33HOvRo0eMryBLwZeaKqi2VgGxAjAukbdM5aWySW2Vu3TpYhMvvti+5MFtR//sxZdftltvvdXefPPNGF/jqXwVyCqpnJUAAMDH+TG21Jo8riWRPKq1svIy27Zju732+mt2x1132stvzLF+AwbYpEkT7dzzJtigwYOt1MfxMCubzv/tqK2xmrraeF9S5gFtaclH5vtZJd3on/U9sHM43fz/kXHaSNqhZhpedkoVlRXW0NhoPXv1somTJtlVV15pfXr3tudemGl33Hmnvfraq1bf2GDlFeU+XoM1+tqVeYAbZd/CvFtMKodUFoXXuDZT9J5EIpFIpIMllarGCJDGpkbbtn27vf766/bLX/3aZs5+yYYNH2aXXzbVxp893np70NVYuPyd/X/nq2p41VZUtbUHap+KZftOXBzQpvzE5675fRugQDbdfKd8lfoJgE4i+vXvZ+ece45dfvllUTv7+NNP2+9vv92WL19udfX1UeaqqVVwW+/v91qhbHbVXG4AABxEuE7cjhRfwo4gqdAGVs0OVGOvgGnWzJl2z91324svvWQDBgywSydNsnPOOdv69esX46r9p6ZNbWc1bZpeSZ/re3ycyr24fFReqfmPynf8+PF2+dQpVlFebs/PeMGmTbs3HkWsQDhNq2FNr2YJeq9tpu/S9gMAoL2iTW07o8BHQVEKQlNAtGnTpujl4Lbbb4uAasDAgTb10kvsrLPOjD5VJY0vKTDT/qNhzVdBlsZhn2pZKp9U5ukzUZDas2dPu/DCC+zqq660bl272hNPPWW33XZb3DxWPG06iZBUK57KXeOlbQMAQHtCTW07Uu4BUX1dvac6K/MgqLLQXdS2rVvttddes9//7nf24uyXrE/ffvGAAPWl2q9vX2vSI3I9afrS5qdbff4idFb85ikNN4fTxZ/nhMq2Z4+edvXV19hlfkKhQPWBBx+0+++/L2psG+qzfoC1LbQdte2qKitje+ozbU+9elSbzbBQBrtqLjcAAA4iEaGU+AGO1A6S/9Nd9hXlFdbY0Bhp04aN9uorr9pD9z9oM6a/YP36DbAvfeEqu3TyJRFgKfhRMKtASeMrIGpx3p9DSkFrCtKKg7UYRwN6zUkqLSmJILW6qsouveRSu3DChNgG9067z+69Z5otWbzYtm/d5oFrowe49f7jLYltqXWsUztdD2jVdEHBccxT5VBUFno1VQwXvSeRSCQS6WBJpVyqbD/q6mqbL31ru+sRrHPmzLG77rrLZrzwgg0cNNC+cMXlNnHixOjCS00KdFOTxlfSpW5uLPzsffjhh3HD2Le//W27ZNKk6ELt/vsfiAdgvP32itiG6jpN2yI9+EJND/Retbd6DwBAe1Oa2kji4FdbWxdBkNpd6olh6g/1vvvvsxkzX7A+/frZNVdfbZdffnkESOr4v1u3bvF0q+J2m5wDfbZU9jqhSI8d/trXvmYXXnCBde7a1Z6b/rzdffc9tnLlyhhXv9100qGeJ3SiwkkqAKC9oqa2HamqqowaPtXAqg3trbf+3B559HEbOHCwXf2Fq2zChAkRHCkp8E130yu40l33CrgqKsrjM3x2FNDq6W0KWLUtvvzlL9vlUy6NE4zHn3rKfvazn8UJibZlVw92Jd0AmF4BAGhvStPd1zj4VVd3sA0bNtjMmTNt2j3TbM7cuTZ8+HD7wpVX2qRJk6JmVk0SdBe+gqmNGzfGe9UEKmlfadSNSPhMpBr0HTt2xKseRazAVo8hnnrZZbGduvs2emHWLLv99tvtlVdeaZ5O06jmltpaAEB7RZde7Uiqof3tb35rMzwwGjxksAdKV9iECedGjZ+CIQW277zzTgRJasupNpraRxRYKbDV5/hsKChVbawC2srKStuyZUtzm9lBgwbZhRdeaJdOnmzdu3ez5194IdpCq7sv1aRrWj0AQyKw9Z81oS0AoD3hjpLciPvVd5tUOVdSon5M1Sl/k9XVqd9Y9Uer2rss0HnhhRn269/+zl6dM8cOPXSETblksp1yyikRJCkw0oMV6uvropZWsiYHGmqy2toan0djBLloiULIfUupllXBqU5AVAOrG8ZENbbqL/iiiy6yq668yjp26GhPPfOs/c//8c9Ro55q0nUCosfvRlBb2D1KSkviyWT1akZSX2uVVZUxz13tehcpAAB5QlB7kFAwo0BINakKcBQYqbZPr2pCMH36DLv1F7+0eW+9ZYceMtwuuvACO+OMM2zQoIERqCpgVUClwKi8XB3867L2zp4O9LmUeoCEz0oW1KrWNZW3hkUnHdquahpyyrhx0RShT+/e9trcuXbzzTfbe++9F8Gtglg9elf0eN1GBbk+Xz1it8L3Bz2qd7vvI76kGCchiAUA5B3NDw4SCn6UirenAqTNmzfbq6++ar/+zW/stTfm2NAhg23yxIl2ztln2+DBg+NmI40n7Attn7ax2tqef/55NnnSJOvTp7c988xT9v//t3+3NWvWRDCsFDW9fqKiADc1IamoyLoC03e7xLQAAOQevR8cJLIa1vJoOqBtqqYDqrl7/vnn7fY7bveA9g075qgj44awM8860/r37x+1f7qsrfE1PUFt26egVttZbZ/POeds+8qXvmTbt9fYk08/bfdMm2aLFi/+SN+12q7avnqvWlwNK7D1LwtzBADg4EBN7UFCQaxq4FLbSt1kNHfuXLvttttt1osv2ohDDrHLp06xc889xwYMGBDjK/jR9lfi5CYftG3TjWE6MdFJysUXX2zDhgy2xx57zO68405bsGBBjKPgV9tZTVLid+6buKamNqu5LcwPAICDBV16HURSwKMHJ7z++utRczf75Zdt6LDhdsVll9vYsWMjEEo1eKqxU82u3qc2m2jbtN20vdRWWsGp2k1/4xvfiF4s1HPCo48/bvfed5/Nnz8/auG1TXXCEtvcX3UjYAS4AAAcZPyYRyBzMNANQKVlZbZp06aooZ12771xd/zQYUPjEvW5E86NS9YKihTclHtAW1nUy4ECHwVJuZJVPmbNQwvDqQqy+PODSdwE5kGpatl1UlLiv191vfbFq6+2Ceeea7369LHnps+w++6/3+bNmxe19wp21QtGfX1DTKtaXgAADjbR/KBJAQEp10nBzfoN6+2FWTPt7nun2UuvvGIDBw+2L1x1pU2aPMl69upppR4QZeOWRKpvqLfa+jpr9PCvpKzU6hsbPjbfNp20B/trcUAbr6JztcL7FqfNaVJQqvWq8223dfs269qtq+2orYmTlC9ec7VdednU6CHhxRdfsmnTptkbb7xhejyyJmtUswUPbj+JlvJAIpFIJFJbTNwolgu+pVxqKhInIoXtli4lq8mBamjvumeaPfns81Fjd/VVV9jEiROjpk6XohNNW19fH0nT61K2au9U+5c3u91/D+LdWldXtL207VQzn9rODh06NNrYXnD+hDjJeeyJJ+2+++6zJYsXx7YuLdPJTGls59aKR38cAADIE4LaHCgry4IY3fylVz3dSzf/aNupTaVeZ82aZb/45a9s1ouzbeSIEfbNa//ILr/88nhSmAJeBUIKghQYa3zNR0nDCngk7orPlWzf1ToUJ7MGfVgYPrho+6X2z9p+Ejd++bbVdu7SpYt99atftUsvnRT7yVNPP2O/+93vbP36dTF+XV1tjEvMCgA42NCgNgcaGrK+RxWgKjDZsGFDBDWqgV2/fr1Nnz7dfnf7HTZ/wQI78bhj7PKpl9qoUaOsc+fOzUFs1naaUKY9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'; // Reemplaza con la imagen en formato base64' // Reemplaza con la URL de tu imagen
    doc.addImage(logoUrl, 'PNG', 10, 10, 30, 30) // Asegúrate de ajustar la posición y el tamaño

    // Título y encabezado
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('Comprobante de Donación', 60, 30)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Número de orden: #${orderNumber}`, 20, 50)
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 20, 56)

    // Línea de separación
    doc.line(20, 60, 190, 60)

    // Información del cliente
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Cliente', 20, 70)
    doc.text('Nosotros', 130, 70)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`${name}`, 20, 78)
    doc.text(`${email}`, 20, 84)

    // Información de la organización
    doc.text('SOLVIA ONG', 130, 78)
    doc.text('Manzanillo, Col. El naranjo', 130, 84)
    doc.text('solviacorp@gmail.com', 130, 90)

    // Línea de separación para la tabla
    doc.line(20, 100, 190, 100)

    // Tabla de descripción, cantidad y precio
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Descripción', 25, 108)
    doc.text('Cantidad', 100, 108)
    doc.text('Precio', 160, 108)

    // Valores de la tabla
    doc.setFont('helvetica', 'normal')
    doc.text('Donación a SOLVIA', 25, 116)
    doc.text('1', 110, 116)
    doc.text(`${Number(donationAmount).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`, 160, 116)

    // Línea de separación debajo de la tabla
    doc.line(20, 122, 190, 122)

    // Totales: Subtotal, IVA y Total
    doc.setFontSize(12)
    doc.text(`Subtotal: ${subtotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`, 140, 130)
    doc.text(`IVA (16%): ${iva.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`, 140, 136)
    doc.setFont('helvetica', 'bold')
    doc.text(`Total: ${total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`, 140, 142)

    // Firma simulada
    doc.setFont('helvetica', 'bold')
    doc.text('SOLVIA ONG', 20, 160)
    doc.setDrawColor(0)
    doc.setLineWidth(0.5)
    doc.line(20, 165, 80, 165)
    doc.setFont('helvetica', 'italic')
    doc.text('Firma de SOLVIA', 20, 175)

    // Mensaje de agradecimiento
    doc.setFontSize(16)
    doc.setTextColor(255, 165, 0)
    doc.text('¡Gracias!', 140, 180)

    // Términos y condiciones
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('TÉRMINOS Y CONDICIONES DE LA DONACIÓN:', 105, 200, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.text('• La donación es final y no es reembolsable bajo ninguna circunstancia.', 105, 208, { align: 'center' })
    doc.text('• Los fondos recaudados serán destinados exclusivamente a programas sociales.', 105, 214, { align: 'center' })
    doc.text('• Los donantes podrán solicitar un comprobante fiscal de su donación.', 105, 220, { align: 'center' })
    doc.text('• SOLVIA se compromete a usar las donaciones de manera transparente.', 105, 226, { align: 'center' })

    // Guardar el documento
    doc.save('Comprobante_Donacion.pdf')

    // Incrementar el número de orden para la próxima donación
    setOrderNumber(prevOrderNumber => prevOrderNumber + 1)

    // Limpiar los campos del formulario y la cantidad de la donación
    setFormData({
      email: '',
      card: '',
      name: '',
      country: 'es',
      postalCode: '',
      cvv: '',          // Añadir cvv al estado inicial
      cardExpiry: ''    // También añadir cardExpiry
    })
    setDonationAmount('')
  }

  const handleDonar = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const isCardExpiryValid = validateCardExpiry();
    const isNameValid = validateName(formData.name);
    const isPostalCodeValid = validatePostalCode(formData.postalCode, formData.country);
  const isCvvValid = formData.cvv?.length === 3;  // Usar optional chaining
    const isAmountValid = validateAmount(donationAmount);
    const isEmailValid = validateEmail(formData.email);

    if (!formData.cvv || formData.cvv.length !== 3) {
    setErrors(prev => ({
      ...prev,
      cvv: 'El CVV debe tener 3 dígitos'
    }));
    return;
  }
    // Check card number
    if (formData.card.length !== 16) {
      setErrors(prev => ({
        ...prev,
        card: 'El número de tarjeta debe tener 16 dígitos'
      }));
      return;
    }

    // Check donation amount
    if (!donationAmount || donationAmount <= 0) {
      setMessage('La cantidad de donación debe ser mayor a 0.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    // Check if any validation failed
    if (!isAmountValid || !isEmailValid || !isCardExpiryValid || !isNameValid || !isPostalCodeValid || !isCvvValid) {
      setMessage('Por favor, corrija los errores en el formulario.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    // Check for empty required fields
    if (!donationAmount || !formData.email || !formData.card || !formData.name || !formData.postalCode || !formData.cardExpiry || !formData.cvv) {
      setMessage('Por favor complete todos los campos.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    try {
      
      await axios.post(`http://localhost:5000/donar/usuarios`, {
        amount: donationAmount,
      });
      
      generarFacturaPDF();
      setSuccessMessage('¡Donación realizada con éxito!');
    } catch (error) {
      console.log(error)
      setMessage('Error procesando el pago.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 flex text-white">
      {/* Contenedor izquierdo (título y texto) */}
      <div className="w-1/3 bg-[#EEE5E9] flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-black">
          ¡Apoya nuestra causa!
        </h1>
        <p className="text-lg text-black">
          Tu donación marca la diferencia en la vida de muchas personas. Gracias
          por unirte a nuestro esfuerzo para crear un cambio positivo.
        </p>
      </div>
  
      {/* Contenedor derecho (componente existente) */}
      <div className="w-2/3 flex items-center justify-center">
        <div className="w-full max-w-[1000px] bg-[#505552] rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left Column */}
            <div className="md:w-1/2 p-8 bg-[#383D3B]">
              <div className="mb-8">
                <div className="flex items-center gap-4">
                  <button
                    className="text-gray-400 hover:text-gray-300"
                    onClick={() => (window.location.href = "/index")}
                  >
                    <ArrowLeft className="h-6 w-6" />
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="font-medium text-gray-300">SOLVIA</span>
                    <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                      DONACION
                    </span>
                  </div>
                </div>
              </div>
              <h1 className="text-xl font-semibold text-gray-300 mb-6">
                Donar a SOLVIA para fondeo de programas
              </h1>
              <div className="text-3xl font-bold mb-8">
                $
                {donationAmount
                  ? parseFloat(donationAmount).toFixed(2)
                  : "0.00"}
              </div>
              <div className="bg-[#EEE5E9] p-6 rounded-lg shadow-md">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-8 w-8 text-black" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-black">Tu donación</h3>
                    <div className="text-sm text-black">Ayuda a nuestra causa</div>
                  </div>
                  <div className="font-medium text-black">
                    $
                    {donationAmount
                      ? parseFloat(donationAmount).toFixed(2)
                      : "0.00"}
                  </div>
                </div>
              </div>
            </div>
  
            {/* Right Column */}
            <div className="md:w-1/2 p-8">
              <h2 className="text-2xl font-semibold mb-6">Pagar con tarjeta</h2>
              <form onSubmit={handleDonar} className="space-y-6">
                {/* Cantidad a donar */}
                <div className="space-y-2">
                  <label
                    htmlFor="donation"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Cantidad a donar
                  </label>
                  <input
                    id="donation"
                    type="text"
                    placeholder="0.00"
                    value={donationAmount}
                    onChange={handleDonationChange}
                    className={`w-full px-4 py-2 border ${
                      errors.amount ? "border-red-600" : "border-gray-600"
                    } bg-[#EEE5E9] text-black rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:outline-none`}
                  />
                  {errors.amount && (
                    <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                  )}
                </div>
  
                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@ejemplo.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border ${
                      errors.email ? "border-red-600" : "border-gray-600"
                    } bg-[#EEE5E9] text-black rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:outline-none`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
  
                {/* Información de la tarjeta */}
                <div className="space-y-2">
                  <label
                    htmlFor="card"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Información de la tarjeta
                  </label>
                  <input
                    id="card"
                    name="card"
                    placeholder="1234 1234 1234 1234"
                    value={formData.card}
                    onChange={handleCardChange}
                    className={`w-full px-4 py-2 border ${
                      errors.card ? "border-red-600" : "border-gray-600"
                    } bg-[#EEE5E9] text-black rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:outline-none`}
                  />
                  {errors.card && (
                    <p className="text-red-500 text-sm mt-1">{errors.card}</p>
                  )}
  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <input
                        placeholder="MM / AA"
                        name="cardExpiry"
                        value={formData.cardExpiry || ""}
                        onBlur={validateCardExpiry}
                        onChange={handleCardExpiryChange}
                        className={`w-full px-4 py-2 border ${
                          errors.cardExpiry ? "border-red-600" : "border-gray-600"
                        } bg-[#EEE5E9] text-black rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:outline-none`}
                      />
                      {errors.cardExpiry && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.cardExpiry}
                        </p>
                      )}
                    </div>
  
                    <div className="space-y-1">
                      <input
                        placeholder="CVC"
                        value={formData.cvv}
                        onChange={handleCvvChange}
                        className={`w-full px-4 py-2 border ${
                          errors.cvv ? "border-red-600" : "border-gray-600"
                        } bg-[#EEE5E9] text-black rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:outline-none`}
                      />
                      {errors.cvv && (
                        <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                      )}
                    </div>
                  </div>
                </div>
  
                {/* Nombre del titular */}
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Nombre del titular
                  </label>
                  <input
                    id="name"
                    name="name"
                    placeholder="Nombre completo en la tarjeta"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, name: e.target.value }));
                      validateName(e.target.value);
                    }}
                    className={`w-full px-4 py-2 border ${
                      errors.name ? "border-red-600" : "border-gray-600"
                    } bg-[#EEE5E9] text-black rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:outline-none`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
  
                {/* País o región y código postal */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    País o región
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-600 bg-[#EEE5E9] text-black rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                  >
                    <option value="es">España</option>
                    <option value="mx">México</option>
                    <option value="ar">Argentina</option>
                    <option value="co">Colombia</option>
                  </select>
  
                  <div className="space-y-1">
                    <input
                      placeholder="Código postal"
                      value={formData.postalCode}
                      name="postalCode"
                      onChange={handlePostalCodeChange}
                      className={`w-full px-4 py-2 border ${
                        errors.postalCode
                          ? "border-red-600"
                          : "border-gray-600"
                      } bg-[#EEE5E9] text-black rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:outline-none`}
                    />
                    {errors.postalCode && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.postalCode}
                      </p>
                    )}
                  </div>
                </div>
  
                {/* Botón de donación */}
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-[#92DcE5] text-black rounded-md shadow-sm hover:bg-white focus:ring-2 focus:ring-gray-400 focus:outline-none"
                >
                  Donar $
                  {donationAmount
                    ? parseFloat(donationAmount).toFixed(2)
                    : "0.00"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
  
      {/* Animaciones y componentes MUI */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeIn" }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              {/* Icono de palomita */}
              <h2 className="text-white text-2xl font-bold mb-4">
                {successMessage}
              </h2>
              <div className="flex justify-center items-center">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    hidden: { opacity: 0, pathLength: 0 },
                    visible: { opacity: 1, pathLength: 1 },
                  }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="flex justify-center items-center"
                  style={{
                    borderRadius: "50%",
                    backgroundColor: "#4CAF50",
                    width: "80px",
                    height: "80px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FaCheck size={50} className="text-white" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  
      <AnimatePresence>
        {message && snackbarSeverity === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeIn" }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              <h2 className="text-white text-2xl font-bold mb-4">{message}</h2>
              <motion.div
                className="flex justify-center items-center"
                style={{
                  borderRadius: "50%",
                  backgroundColor: "#4CAF50",
                  width: "80px",
                  height: "80px",
                }}
              >
                <FaCheck size={50} className="text-white" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
}  
