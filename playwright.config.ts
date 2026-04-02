import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Diretório onde estão os arquivos de teste
  testDir: './tests',

  // Executa os testes de cada arquivo em paralelo
  fullyParallel: true,

  // Impede que test.only() seja commitado acidentalmente em CI
  forbidOnly: !!process.env.CI,

  // Número de tentativas em caso de falha
  retries: process.env.CI ? 2 : 0,

  // Gerador de relatórios (HTML é o padrão)
  reporter: 'html',

  // Configurações compartilhadas por todos os testes
  use: {
    // URL base — permite usar page.goto('/') em vez da URL completa
    baseURL: 'https://jp-ghost.github.io/02-testeautomacao-joao-robson/',

    // Captura trace apenas na primeira tentativa após falha
    trace: 'on-first-retry',
  },

  // Navegadores onde os testes serão executados
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});