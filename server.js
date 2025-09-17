const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

const users = [
  { email: 'bob.last@gmail.com', passwordHash: bcrypt.hashSync('yourPasswordHere', 10) }
];

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);

  if (!user) return res.json({ message: 'User not found' });

  const match = await bcrypt.compare(password, user.passwordHash);
  res.json({ message: match ? 'Login successful!' : 'Incorrect password' });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));