import { test, expect } from '@playwright/test';

test.describe('QS Acadêmico — Testes do Sistema de Notas', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ---------------- Estado inicial

  test('página carrega corretamente', async ({ page }) => {
    await expect(page).toHaveTitle(/QS Acadêmico/);
    await expect(page.locator('#secao-cadastro')).toBeVisible();
    await expect(page.locator('#tabela-alunos')).toBeVisible();
  });

  test('tabela inicia vazia', async ({ page }) => {
    await expect(page.locator('td.texto-central'))
      .toHaveText('Nenhum aluno cadastrado.');
  });

  // ---------------- Cadastro

  test('cadastrar aluno válido', async ({ page }) => {
    await page.locator('#nome').fill('João Silva');
    await page.locator('#nota1').fill('7');
    await page.locator('#nota2').fill('8');
    await page.locator('#nota3').fill('6');

    await page.click('button[type="submit"]');

    await expect(page.locator('#tabela-alunos tbody tr'))
      .toContainText('João Silva');
  });

  test('não cadastrar sem nome', async ({ page }) => {
    await page.locator('#nota1').fill('7');
    await page.locator('#nota2').fill('8');
    await page.locator('#nota3').fill('6');

    await page.click('button[type="submit"]');

    await expect(page.locator('#mensagem'))
      .toContainText('preencha o nome');
  });

  // ---------------- BUG DA MÉDIA (vai falhar)

  test('calcular média correta das três notas', async ({ page }) => {
    await page.locator('#nome').fill('Pedro');
    await page.locator('#nota1').fill('8');
    await page.locator('#nota2').fill('6');
    await page.locator('#nota3').fill('10');

    await page.click('button[type="submit"]');

    // Média correta seria 8.00
    await expect(page.locator('#tabela-alunos tbody tr td').nth(4))
      .toHaveText('8.00');
  });

  // ---------------- Validação notas

  test('rejeitar nota > 10', async ({ page }) => {
    await page.locator('#nome').fill('Teste');
    await page.locator('#nota1').fill('11');
    await page.locator('#nota2').fill('8');
    await page.locator('#nota3').fill('7');

    await page.click('button[type="submit"]');

    await expect(page.locator('#mensagem'))
      .toContainText('entre 0 e 10');
  });

  test('rejeitar nota < 0', async ({ page }) => {
    await page.locator('#nome').fill('Teste');
    await page.locator('#nota1').fill('-1');
    await page.locator('#nota2').fill('8');
    await page.locator('#nota3').fill('7');

    await page.click('button[type="submit"]');

    await expect(page.locator('#mensagem'))
      .toContainText('entre 0 e 10');
  });

  // ---------------- Busca

  test('buscar aluno pelo nome', async ({ page }) => {
    // Carlos
    await page.fill('#nome', 'Carlos');
    await page.fill('#nota1', '7');
    await page.fill('#nota2', '7');
    await page.fill('#nota3', '7');
    await page.click('button[type="submit"]');

    // Mariana
    await page.fill('#nome', 'Mariana');
    await page.fill('#nota1', '8');
    await page.fill('#nota2', '8');
    await page.fill('#nota3', '8');
    await page.click('button[type="submit"]');

    await page.fill('#busca', 'Carlos');

    await expect(page.locator('#tabela-alunos tbody tr'))
      .toHaveCount(1);
  });

  // ---------------- Exclusão

  test('excluir aluno', async ({ page }) => {
    await page.fill('#nome', 'Excluir Eu');
    await page.fill('#nota1', '7');
    await page.fill('#nota2', '7');
    await page.fill('#nota3', '7');
    await page.click('button[type="submit"]');

    await page.click('button[aria-label="Excluir Excluir Eu"]');

    await expect(page.locator('td.texto-central')).toBeVisible();
  });

  // ---------------- Situação

  test('situação Aprovado', async ({ page }) => {
    await page.fill('#nome', 'Aprovado');
    await page.fill('#nota1', '9');
    await page.fill('#nota2', '8');
    await page.fill('#nota3', '7');
    await page.click('button[type="submit"]');

    await expect(page.locator('.badge-aprovado')).toBeVisible();
  });

  test('situação Reprovado', async ({ page }) => {
    await page.fill('#nome', 'Reprovado');
    await page.fill('#nota1', '2');
    await page.fill('#nota2', '3');
    await page.fill('#nota3', '4');
    await page.click('button[type="submit"]');

    await expect(page.locator('.badge-reprovado')).toBeVisible();
  });

  test('situação Recuperação', async ({ page }) => {
    await page.fill('#nome', 'Rec');
    await page.fill('#nota1', '6');
    await page.fill('#nota2', '5');
    await page.fill('#nota3', '6');
    await page.click('button[type="submit"]');

    await expect(page.locator('.badge-recuperacao')).toBeVisible();
  });

  // ---------------- Estatísticas

  test('estatísticas corretas', async ({ page }) => {
    const dados = [
      ['A', '8', '8', '8'],
      ['B', '6', '5', '6'],
      ['C', '2', '3', '4'],
    ];

    for (const [nome, n1, n2, n3] of dados) {
      await page.fill('#nome', nome);
      await page.fill('#nota1', n1);
      await page.fill('#nota2', n2);
      await page.fill('#nota3', n3);
      await page.click('button[type="submit"]');
    }

    await expect(page.locator('#stat-total')).toHaveText('3');
    await expect(page.locator('#stat-aprovados')).toHaveText('1');
    await expect(page.locator('#stat-recuperacao')).toHaveText('1');
    await expect(page.locator('#stat-reprovados')).toHaveText('1');
  });

  // ---------------- Limpar tudo (confirm)

  test('limpar tudo confirmando', async ({ page }) => {
    await page.fill('#nome', 'João');
    await page.fill('#nota1', '7');
    await page.fill('#nota2', '7');
    await page.fill('#nota3', '7');
    await page.click('button[type="submit"]');

    page.on('dialog', d => d.accept());
    await page.click('#btn-limpar');

    await expect(page.locator('td.texto-central')).toBeVisible();
  });

  test('não limpar ao cancelar', async ({ page }) => {
    await page.fill('#nome', 'João');
    await page.fill('#nota1', '7');
    await page.fill('#nota2', '7');
    await page.fill('#nota3', '7');
    await page.click('button[type="submit"]');

    page.on('dialog', d => d.dismiss());
    await page.click('#btn-limpar');

    await expect(page.locator('#tabela-alunos')).toContainText('João');
  });

});