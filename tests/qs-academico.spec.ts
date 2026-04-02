import { test, expect } from '@playwright/test';

test.describe('QS Acadêmico — Sistema de Gestão de Notas', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  // =========================
  // 1. Cadastro válido
  // =========================
  test('1) Cadastrar aluno com dados válidos', async ({ page }) => {
    await page.getByLabel('Nome do Aluno').fill('João Silva');
    await page.getByLabel('Nota 1').fill('7');
    await page.getByLabel('Nota 2').fill('8');
    await page.getByLabel('Nota 3').fill('6');
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    // Verifica se a tabela tem exatamente 1 aluno
    await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);

    // Verifica se "João Silva" aparece na tabela (não na mensagem)
    await expect(
      page.locator('#tabela-alunos tbody tr td', { hasText: 'João Silva' })
    ).toBeVisible();
  });

  // =========================
  // 2. Mensagem de sucesso
  // =========================
  test('2) Exibir mensagem de sucesso após cadastro', async ({ page }) => {
    await page.getByLabel('Nome do Aluno').fill('Ana Costa');
    await page.getByLabel('Nota 1').fill('9');
    await page.getByLabel('Nota 2').fill('8');
    await page.getByLabel('Nota 3').fill('10');
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    await expect(page.locator('#mensagem')).toContainText('cadastrado com sucesso');
  });

  // =========================
  // 3. Rejeitar sem nome
  // =========================
  test('3) Rejeitar cadastro sem nome', async ({ page }) => {
    await page.getByLabel('Nota 1').fill('7');
    await page.getByLabel('Nota 2').fill('8');
    await page.getByLabel('Nota 3').fill('6');
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    await expect(page.locator('#mensagem')).toContainText('preencha o nome');
  });

  // =========================
  // 4. Média aritmética correta
  // =========================
  test('4) Calcular média das três notas', async ({ page }) => {
    await page.getByLabel('Nome do Aluno').fill('Pedro Santos');
    await page.getByLabel('Nota 1').fill('8');
    await page.getByLabel('Nota 2').fill('6');
    await page.getByLabel('Nota 3').fill('10');
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    // Seleciona a célula da média
    const media = page.locator('#tabela-alunos tbody tr td').nth(4);

    // Usa regex para evitar problemas de WebKit (espaços invisíveis)
    await expect(media).toHaveText(/^8\.00$/); // AQUI DEVE FALHAR se o cálculo estiver errado
  });

  // =========================
  // 5. Validação intervalo notas
  // =========================
  test('5) Notas fora do intervalo 0–10', async ({ page }) => {
    await page.getByLabel('Nome do Aluno').fill('Erro Nota');
    await page.getByLabel('Nota 1').fill('15');
    await page.getByLabel('Nota 2').fill('8');
    await page.getByLabel('Nota 3').fill('6');
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    await expect(page.locator('#mensagem')).toContainText('entre 0 e 10');
  });

  // =========================
  // 6. Filtro por nome
  // =========================
  test('6) Busca por nome', async ({ page }) => {
    await page.getByLabel('Nome do Aluno').fill('Carlos Lima');
    await page.getByLabel('Nota 1').fill('7');
    await page.getByLabel('Nota 2').fill('7');
    await page.getByLabel('Nota 3').fill('7');
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    // Preenche filtro
    await page.getByLabel('Buscar por nome').fill('Carlos');

    // Valida apenas na tabela
    await expect(
      page.locator('#tabela-alunos tbody tr td', { hasText: 'Carlos Lima' })
    ).toBeVisible();
  });

  // =========================
  // 7. Exclusão individual
  // =========================
  test('7) Exclusão individual de aluno', async ({ page }) => {
    await page.getByLabel('Nome do Aluno').fill('Excluir Teste');
    await page.getByLabel('Nota 1').fill('7');
    await page.getByLabel('Nota 2').fill('7');
    await page.getByLabel('Nota 3').fill('7');
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    await page.getByRole('button', { name: /Excluir/ }).click();
    await expect(page.getByText('Excluir Teste')).not.toBeVisible();
  });

  // =========================
  // 8. Estatísticas
  // =========================
  test('8) Estatísticas atualizam corretamente', async ({ page }) => {
    await page.getByLabel('Nome do Aluno').fill('Estatistica A');
    await page.getByLabel('Nota 1').fill('9');
    await page.getByLabel('Nota 2').fill('9');
    await page.getByLabel('Nota 3').fill('9');
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    await expect(page.locator('#stat-total')).toHaveText('1');
    await expect(page.locator('#stat-aprovados')).toHaveText('1');
  });

  // =========================
  // 9,10,11. Situações
  // =========================
  test('9) Situação Aprovado (≥7)', async ({ page }) => {
    await page.getByLabel('Nome do Aluno').fill('Aprovado');
    await page.getByLabel('Nota 1').fill('8');
    await page.getByLabel('Nota 2').fill('8');
    await page.getByLabel('Nota 3').fill('8');
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    // Valida situação apenas na tabela
    await expect(
      page.locator('#tabela-alunos tbody tr td span.badge-aprovado', { hasText: 'Aprovado' })
    ).toBeVisible();
  });

  test('10) Situação Reprovado (<5)', async ({ page }) => {
    await page.getByLabel('Nome do Aluno').fill('Reprovado');
    await page.getByLabel('Nota 1').fill('3');
    await page.getByLabel('Nota 2').fill('4');
    await page.getByLabel('Nota 3').fill('2');
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    // Valida situação apenas na tabela
    await expect(
      page.locator('#tabela-alunos tbody tr td span.badge-reprovado', { hasText: 'Reprovado' })
    ).toBeVisible();
  });

  test('11) Situação Recuperação (5–6.9)', async ({ page }) => {
    await page.getByLabel('Nome do Aluno').fill('Recuperacao');
    await page.getByLabel('Nota 1').fill('5');
    await page.getByLabel('Nota 2').fill('6');
    await page.getByLabel('Nota 3').fill('6');
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    // Valida situação apenas na tabela
    await expect(
      page.locator('#tabela-alunos tbody tr td span.badge-recuperacao', { hasText: 'Recuperação' })
    ).toBeVisible();
  });

  // =========================
  // 12. Múltiplos cadastros
  // =========================
  test('12) Três alunos geram três linhas', async ({ page }) => {
    for (let i = 1; i <= 3; i++) {
      await page.getByLabel('Nome do Aluno').fill(`Aluno ${i}`);
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('7');
      await page.getByRole('button', { name: 'Cadastrar' }).click();
    }

    await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(3);
  });

});