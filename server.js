const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const path = require('path');

const app = express();
const port = 3000;

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/meuProjeto', { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

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
  aprovadoDono: { type: Boolean, default: false }
});

const Aluno = mongoose.model('Aluno', alunoSchema);

// Rota para receber os dados do formulário
app.post('/enviarFormulario', async (req, res) => {
  const novoAluno = new Aluno(req.body);
  await novoAluno.save();
  res.redirect('/paginaAdmin.html');
});

// Rota para listar os alunos para o admin
app.get('/admin/alunos', async (req, res) => {
  const alunos = await Aluno.find({ aprovadoAdmin: false });
  res.json(alunos);
});

// Rota para aprovar aluno pelo admin
app.post('/admin/aprovar/:id', async (req, res) => {
  await Aluno.findByIdAndUpdate(req.params.id, { aprovadoAdmin: true });
  res.redirect('/userDono.html');
});

// Rota para listar os alunos para o dono
app.get('/dono/alunos', async (req, res) => {
  const alunos = await Aluno.find({ aprovadoAdmin: true, aprovadoDono: false });
  res.json(alunos);
});

// Rota para aprovar aluno pelo dono
app.post('/dono/aprovar/:id', async (req, res) => {
  await Aluno.findByIdAndUpdate(req.params.id, { aprovadoDono: true });
  res.redirect('/paginaAdmin.html-1');
});

// Rota para gerar contrato em PDF
app.get('/gerarContrato/:id', async (req, res) => {
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

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});