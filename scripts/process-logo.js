#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

console.log('🔍 Verificando se há nova logo do app...')

try {
  // Verificar se existe logo salva no localStorage (simulado via arquivo temporário)
  const tempLogoPath = path.join(projectRoot, '.temp-logo.json')
  
  let logoData = null
  
  // Tentar ler dados da logo do arquivo temporário ou do settings
  if (fs.existsSync(tempLogoPath)) {
    const tempData = JSON.parse(fs.readFileSync(tempLogoPath, 'utf8'))
    logoData = tempData
  } else {
    // Tentar ler do settings.json se existir
    const settingsPath = path.join(projectRoot, 'src', 'store', 'settings-data.json')
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
      if (settings.appLogoData) {
        logoData = {
          data: settings.appLogoData,
          filename: 'brand-agendei.png',
          updated: settings.appLogoUpdated
        }
      }
    }
  }
  
  if (!logoData || !logoData.data) {
    console.log('ℹ️  Nenhuma nova logo encontrada. Usando logo padrão.')
    // Em ESM não é permitido usar return no topo
    process.exit(0)
  }
  
  console.log('📸 Nova logo encontrada! Processando...')
  
  // Converter base64 para buffer
  const buffer = Buffer.from(logoData.data, 'base64')
  
  // Salvar na pasta public (para desenvolvimento)
  const publicPath = path.join(projectRoot, 'public', 'brand-agendei.png')
  fs.writeFileSync(publicPath, buffer)
  console.log('✅ Logo salva em public/brand-agendei.png')
  
  // Salvar na pasta docs (para produção/GitHub Pages)
  const docsDir = path.join(projectRoot, 'docs')
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true })
  }
  const docsPath = path.join(docsDir, 'brand-agendei.png')
  fs.writeFileSync(docsPath, buffer)
  console.log('✅ Logo salva em docs/brand-agendei.png')
  
  // Atualizar manifest.webmanifest se existir
  const manifestPath = path.join(projectRoot, 'public', 'manifest.webmanifest')
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    
    // Atualizar ícones no manifest
    manifest.icons = manifest.icons || []
    
    // Remover ícones antigos do brand-agendei.png
    manifest.icons = manifest.icons.filter(icon => !icon.src.includes('brand-agendei.png'))
    
    // Adicionar novo ícone
    manifest.icons.push({
      "src": "brand-agendei.png",
      "sizes": "192x192 512x512",
      "type": "image/png",
      "purpose": "any maskable"
    })
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
    console.log('✅ Manifest atualizado com nova logo')
  }
  
  // Limpar arquivo temporário
  if (fs.existsSync(tempLogoPath)) {
    fs.unlinkSync(tempLogoPath)
  }
  
  console.log('🎉 Logo do app processada com sucesso!')
  
} catch (error) {
  console.error('❌ Erro ao processar logo:', error.message)
  // Não falhar o build por causa da logo
  process.exit(0)
}