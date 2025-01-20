// Função para validar campos em geral
function validarCampo(campo) {
    if (campo.value.trim() !== '') {
      campo.classList.add('is-valid');
      campo.classList.remove('is-invalid');
    } else {
      campo.classList.add('is-invalid');
      campo.classList.remove('is-valid');
    }
  }
  
  // Função de validação de CPF (já existente)
  function mascaraCPF(campo) {
    let valor = campo.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.slice(0, 11);
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    campo.value = valor;
  }
  
  function validarCPF(campo) {
    const cpfErro = document.getElementById('cpfErro');
    let cpf = campo.value.replace(/\D/g, '');
  
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      cpfErro.style.display = 'block';
      campo.classList.remove('is-valid');
      campo.classList.add('is-invalid');
      return false;
    }
  
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) {
      cpfErro.style.display = 'block';
      campo.classList.remove('is-valid');
      campo.classList.add('is-invalid');
      return false;
    }
  
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) {
      cpfErro.style.display = 'block';
      campo.classList.remove('is-valid');
      campo.classList.add('is-invalid');
      return false;
    }
  
    cpfErro.style.display = 'none';
    campo.classList.remove('is-invalid');
    campo.classList.add('is-valid');
    return true;
  }