import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Checkbox,
  Modal,
  CardMedia,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  YouTube as YouTubeIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import axios from 'axios';

function StudentDashboard({ programId }) {
  const [tasks, setTasks] = useState([]);
  const [openMaterial, setOpenMaterial] = useState(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState("");

  const showErrorMessage = (errors) => {
    const firstError = Object.values(errors)[0];
    setMessage(firstError);
    setSnackbarSeverity('error');
    setOpenSnackbar(true);
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/taskVol/tasks/${programId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        const errorMessage = error.response?.data?.message || "Error al cargar las tareas.";
        setMessage(errorMessage);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    };

    fetchTasks();
  }, [programId]);

  const handleOpenMaterial = (material) => {
    if (material.type === "video" && material.url.includes("youtube.com/watch?v=")) {
      let videoId = material.url.split("v=")[1];
      const ampersandPosition = videoId.indexOf("&");
      if (ampersandPosition !== -1) {
        videoId = videoId.substring(0, ampersandPosition);
      }
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      setOpenMaterial({ ...material, url: embedUrl });
    } else {
      setOpenMaterial(material);
    }
  };

  const handleCloseMaterial = () => {
    setOpenMaterial(null);
  };

  const handleToggleTaskCompletion = (taskId, currentStatus) => {
    const newStatus = !currentStatus;
    console.log('Actualizando tarea:', { taskId, status: newStatus });

    axios.put(`http://localhost:5000/task/status`, {
      taskId,
      status: newStatus
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(() => {
        const updatedTasks = tasks.map(task =>
          task.id === taskId
            ? { ...task, completed: newStatus }
            : task
        );
        setTasks(updatedTasks);
      })
      .catch((error) => {
        console.error('Error updating task status:', error);
        const errorMessage = error.response?.data?.message || "Error al actualizar el estado de la tarea.";
        setMessage(errorMessage);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h5" className="text-white-900 mb-4 font-semibold" gutterBottom>
        Tareas Asignadas
      </Typography>
      <List>
        {tasks.map((task) => (
          <ListItem key={task.id} divider>
            <ListItemText
              primary={task.title}
              secondary={
                <React.Fragment>
                  <Typography component="span" variant="body2" color="text.primary">
                    {task.description}
                  </Typography>
                  <br />
                  Fecha de entrega: {task.end_date}
                </React.Fragment>
              }
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {task.materials && task.materials.map((material, index) => (
                <IconButton key={index} onClick={() => handleOpenMaterial(material)}>
                  {material.type === "video" ? <YouTubeIcon /> : <ImageIcon />}
                </IconButton>
              ))}
              <Checkbox
                edge="end"
                onChange={() => handleToggleTaskCompletion(task.id, task.completed)}
                checked={!!task.completed}
                checkedIcon={<CheckCircleIcon />}
                inputProps={{ 'aria-labelledby': `checkbox-list-label-${task.id}` }}
              />
            </Box>
          </ListItem>
        ))}
      </List>

      <Modal open={!!openMaterial} onClose={handleCloseMaterial}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}>
          <IconButton
            aria-label="close"
            onClick={handleCloseMaterial}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          {openMaterial?.type === "video" ? (
            <iframe
              width="100%"
              height="400"
              src={openMaterial.url}
              title={openMaterial.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <CardMedia
              component="img"
              image={openMaterial?.url}
              alt={openMaterial?.title}
              sx={{ maxHeight: '80vh', objectFit: 'contain' }}
            />
          )}
          <Typography variant="h6" component="h2" mt={2}>
            {openMaterial?.title}
          </Typography>
        </Box>
      </Modal>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default StudentDashboard;
