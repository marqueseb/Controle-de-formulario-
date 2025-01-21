const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const PDFDocument = require('pdfkit');
const path = require('path');

const app = express();
const port = 3000;

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/meuProjeto', { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configurar sessão
app.use(session({
  secret: 'segredo',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Use secure: true em produção com HTTPS
}));

// Middleware de autenticação
function autenticar(req, res, next) {
  if (req.session.usuario) {
    next();
  } else {
    res.redirect('/login.html');
  }
}

// Definir o esquema do aluno
const alunoSchema = new mongoose.Schema({
  nome: String,
  dataNascimento: Date,
  idade: Number,
  nomeResponsavel: String,
  grauParentesco: String,
  profissaoResponsavel: String,
  cepResponsavel: String,
  enderecoResponsavel: String,
  cpfResponsavel: String,
  dataNascimentoResponsavel: Date,
  telefoneResponsavel: String,
  telefoneAluno: String,
  vencimentoPadrao: String,
  alterarVencimento: String,
  novoVencimento: Number,
  diasCurso: [String],
  turno: String,
  idioma: String,
  vipClass: String,
  modalidadeEscolhida: String,
  aprovadoAdmin: { type: Boolean, default: false },
  aprovadoDono: { type: Boolean, default: false },
  dataAprovacao: Date
});

const Aluno = mongoose.model('Aluno', alunoSchema);

// Rota para login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Verifique as credenciais (substitua por verificação real)
  if (username === 'admin' && password === 'senha') {
    req.session.usuario = username;
    res.redirect('/paginaAdmin.html');
  } else {
    res.redirect('/login.html');
  }
});

// Rota para logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login.html');
});

// Rota para receber os dados do formulário
app.post('/enviarFormulario', async (req, res) => {
  const novoAluno = new Aluno(req.body);
  await novoAluno.save();
  res.status(200).send('Formulário enviado com sucesso!');
});

// Rota para listar os alunos para o admin (protegida)
app.get('/admin/alunos', autenticar, async (req, res) => {
  const alunos = await Aluno.find({ aprovadoAdmin: false });
  res.json(alunos);
});

// Rota para aprovar aluno pelo admin (protegida)
app.post('/admin/aprovar/:id', autenticar, async (req, res) => {
  await Aluno.findByIdAndUpdate(req.params.id, { aprovadoAdmin: true, dataAprovacao: new Date() });
  res.redirect('/userDono.html');
});

// Rota para listar os alunos para o dono (protegida)
app.get('/dono/alunos', autenticar, async (req, res) => {
  const alunos = await Aluno.find({ aprovadoAdmin: true, aprovadoDono: false });
  res.json(alunos);
});

// Rota para aprovar aluno pelo dono (protegida)
app.post('/dono/aprovar/:id', autenticar, async (req, res) => {
  await Aluno.findByIdAndUpdate(req.params.id, { aprovadoDono: true });
  res.redirect('/paginaAdmin.html-1');
});

// Rota para gerar contrato em PDF (protegida)
app.get('/gerarContrato/:id', autenticar, async (req, res) => {
  const aluno = await Aluno.findById(req.params.id);
  const doc = new PDFDocument();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=contrato_${aluno.nome}.pdf`);

  doc.pipe(res);
  doc.fontSize(25).text('Contrato de Matrícula', { align: 'center' });
  doc.fontSize(12).text(`Nome do Aluno: ${aluno.nome}`);
  doc.fontSize(12).text(`Responsável: ${aluno.nomeResponsavel}`);
  // Adicione mais informações conforme necessário
  doc.end();
});

// Rota para contar alunos aprovados hoje
app.get('/admin/alunosAprovadosHoje', autenticar, async (req, res) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alunosAprovadosHoje = await Aluno.countDocuments({
    aprovadoAdmin: true,
    dataAprovacao: { $gte: hoje }
  });
  res.json({ count: alunosAprovadosHoje });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});