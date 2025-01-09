# OpenAI Swarm / OpenAI 集群 / OpenAI Sürüsü

A framework for managing multiple AI models working collaboratively.
一个支持多个AI模型协同工作的框架。
Birden fazla AI modelinin işbirliği içinde çalışmasını yöneten bir çerçeve.

## Features / 功能特点 / Özellikler

- Multi-Model Collaboration / 多模型协作 / Çoklu Model İşbirliği
- Dynamic Task Allocation / 动态任务分配 / Dinamik Görev Dağıtımı
- Result Integration / 结果整合 / Sonuç Entegrasyonu
- Performance Monitoring / 性能监控 / Performans İzleme

## Quick Start / 快速开始 / Hızlı Başlangıç

### Requirements / 系统要求 / Sistem Gereksinimleri
```bash
Node.js 16+
pnpm 7+
SQLite3
```

### Installation / 安装步骤 / Kurulum

```bash
# Clone repository / 克隆仓库 / Depoyu klonla
git clone https://github.com/your-repo/openai-swarm.git
cd openai-swarm

# Install dependencies / 安装依赖 / Bağımlılıkları yükle
pnpm install

# Build project / 构建项目 / Projeyi derle
pnpm build

# Copy environment file / 复制环境配置文件 / Ortam dosyasını kopyala
cp .env.example .env

# Start service / 启动服务 / Servisi başlat
pnpm start
```

### Configuration / 配置 / Yapılandırma

Edit `.env` file / 编辑 `.env` 文件 / `.env` dosyasını düzenle:
```env
# Required API Keys / 必需的API密钥 / Gerekli API Anahtarları
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_API_KEY=your_google_api_key

# Optional API Keys / 可选的API密钥 / İsteğe Bağlı API Anahtarları
LLAMA_API_KEY=your_llama_api_key
TOGETHER_API_KEY=your_together_api_key

# Swarm Settings / Swarm配置 / Sürü Ayarları
SWARM_MIN_MODELS=2
SWARM_MAX_MODELS=5
SWARM_VOTING_THRESHOLD=0.6
SWARM_DEFAULT_TIMEOUT=30000
```

## Architecture / 架构说明 / Mimari

```
├── packages/                # Package directory / 包目录 / Paket dizini
│   └── core/               # Core functionality / 核心功能 / Çekirdek işlevsellik
│       ├── src/
│       │   ├── services/   # Service implementations / 服务实现 / Servis uygulamaları
│       │   │   └── swarm/
│       │   │       ├── SwarmService.ts        # Main service / 主服务 / Ana servis
│       │   │       ├── ModelCoordinator.ts    # Model management / 模型管理 / Model yönetimi
│       │   │       └── ModelResultAggregator.ts # Result processing / 结果处理 / Sonuç işleme
│       │   └── types.ts    # Type definitions / 类型定义 / Tip tanımlamaları
│   └── examples/           # Example code / 示例代码 / Örnek kod
```

### Core Components / 核心组件 / Temel Bileşenler

1. **SwarmService / Swarm服务 / Sürü Servisi**
   - Main entry point / 主入口点 / Ana giriş noktası
   - Task management / 任务管理 / Görev yönetimi
   - Service coordination / 服务协调 / Servis koordinasyonu

2. **ModelCoordinator / 模型协调器 / Model Koordinatörü**
   - Model selection / 模型选择 / Model seçimi
   - API integration / API集成 / API entegrasyonu
   - Load balancing / 负载均衡 / Yük dengeleme

3. **ModelResultAggregator / 结果聚合器 / Sonuç Toplayıcı**
   - Result merging / 结果合并 / Sonuç birleştirme
   - Confidence scoring / 置信度评分 / Güven puanlaması
   - Agreement analysis / 一致性分析 / Anlaşma analizi

### Database / 数据库 / Veritabanı
SQLite database (`data/db.sqlite`) stores:
SQLite数据库 (`data/db.sqlite`) 存储：
SQLite veritabanı (`data/db.sqlite`) şunları saklar:

- Execution history / 执行历史 / Yürütme geçmişi
- Performance metrics / 性能指标 / Performans metrikleri
- Model statistics / 模型统计 / Model istatistikleri

## Basic Usage / 基础用法 / Temel Kullanım

```typescript
import { SwarmService } from "./services/swarm/SwarmService";

async function main() {
    // Initialize service / 初始化服务 / Servisi başlat
    const swarmService = new SwarmService();
    await swarmService.initialize();

    // Execute task / 执行任务 / Görevi yürüt
    const result = await swarmService.executeSwarmTask({
        name: "text_generation",
        input: "Write a story"
    });

    console.log(result);
}
```

## Task Types / 任务类型 / Görev Türleri

1. **Text Generation / 文本生成 / Metin Üretimi**
   - Content creation / 内容创作 / İçerik oluşturma
   - Story writing / 故事写作 / Hikaye yazımı

2. **Analysis / 分析 / Analiz**
   - Data processing / 数据处理 / Veri işleme
   - Pattern recognition / 模式识别 / Örüntü tanıma

3. **Knowledge Query / 知识查询 / Bilgi Sorgusu**
   - Q&A / 问答 / Soru-Cevap
   - Information retrieval / 信息检索 / Bilgi alma

## Troubleshooting / 故障排除 / Sorun Giderme

1. **API Key Issues / API密钥问题 / API Anahtarı Sorunları**
   ```bash
   # Check .env file / 检查.env文件 / .env dosyasını kontrol et
   cat .env
   # Verify API keys / 验证API密钥 / API anahtarlarını doğrula
   ```

2. **Database Issues / 数据库问题 / Veritabanı Sorunları**
   ```bash
   # Create data directory / 创建数据目录 / Veri dizinini oluştur
   mkdir -p data
   chmod 777 data
   ```

3. **Timeout Issues / 超时问题 / Zaman Aşımı Sorunları**
   ```env
   # Adjust timeout in .env / 在.env中调整超时 / .env'de zaman aşımını ayarla
   SWARM_DEFAULT_TIMEOUT=60000
   ```

## License / 许可证 / Lisans
MIT License / MIT许可证 / MIT Lisansı
