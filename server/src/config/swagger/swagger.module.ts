/* eslint-disable @typescript-eslint/no-explicit-any */
import { Module, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';

@Module({})
export class AppSwaggerConfig {
  static setup(app: INestApplication): void {
    const configService = app.get(ConfigService<any>);
    const swagger = configService.get('swagger', { infer: true });
    const appConfig = configService.get('app', { infer: true });

    if (!swagger || !swagger.enable) return;

    const builder = new DocumentBuilder()
      .setTitle(swagger.title)
      .setDescription(swagger.description)
      .setVersion(swagger.version)
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, builder);

    SwaggerModule.setup(swagger.path, app, document, {
      swaggerOptions: { persistAuthorization: true },
    });

    app.use('/docs-json', (_req: any, res: any) => {
      const apiPrefix = appConfig.apiPrefix?.replace(/^\/|\/$/g, '') || '';

      const collection: any = {
        info: {
          _postman_id: `elite-${Date.now()}`,
          name: 'Elite Drive API',
          schema:
            'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        },
        variable: [
          {
            key: 'base_url',
            value: apiPrefix ? `${appConfig.url}/${apiPrefix}` : appConfig.url,
            description: 'Server Host',
          },
        ],
        item: [],
      };

      // Group endpoints theo tag và path (bỏ /api)
      const folderMap = new Map<string, { tagName: string; items: any[] }>();

      Object.entries(document.paths ?? {}).forEach(([path, pathItem]) => {
        if (!pathItem) return;

        (['get', 'post', 'put', 'patch', 'delete'] as const).forEach(
          (method) => {
            const operation = (pathItem as any)[method];
            if (!operation) return;

            const example = this.extractExample(operation, document);

            // Remove /api prefix
            let displayPath = path;
            if (path.startsWith('/api/')) {
              displayPath = path.replace('/api', '');
            } else if (apiPrefix && path.startsWith(`/${apiPrefix}`)) {
              displayPath = path.replace(`/${apiPrefix}`, '');
            }

            const cleanPath = displayPath
              .replace(/\{/g, ':')
              .replace(/\}/g, '');

            // Lấy folder name từ path (ví dụ: /auth/register -> auth)
            const pathParts = cleanPath.split('/').filter((p) => p);
            const folderName = pathParts[0] || 'root';
            const endpointName = pathParts[pathParts.length - 1] || 'endpoint';

            const item = {
              name: `${method.toUpperCase()} ${endpointName}`,
              request: {
                method: method.toUpperCase(),
                header: [
                  { key: 'Content-Type', value: 'application/json' },
                  { key: 'Accept', value: 'application/json' },
                ],
                ...(operation.requestBody && {
                  body: {
                    mode: 'raw',
                    raw: JSON.stringify(example, null, 2),
                    options: { raw: { language: 'json' } },
                  },
                }),
                url: `{{base_url}}${displayPath}`,
                description: operation.description || '',
              },
            };

            const tags =
              operation.tags?.length > 0 ? operation.tags : [folderName];

            tags.forEach((tag: string) => {
              if (!folderMap.has(tag)) {
                folderMap.set(tag, { tagName: tag, items: [] });
              }
              folderMap.get(tag)!.items.push(item);
            });
          },
        );
      });

      // Convert to collection structure: folder theo tag, endpoint flat dưới folder
      collection.item = Array.from(folderMap.values()).map((folder) => ({
        name: folder.tagName.toUpperCase(),
        item: folder.items,
      }));

      res.json(collection);
    });
  }

  private static extractExample(operation: any, document: OpenAPIObject): any {
    const schema = operation.requestBody?.content?.['application/json']?.schema;
    if (!schema) return {};
    return this.resolveSchema(schema, document);
  }

  private static resolveSchema(schema: any, document: OpenAPIObject): any {
    if (schema.$ref) {
      const refName = schema.$ref.split('/').pop();
      const refSchema = (document.components?.schemas as any)?.[refName];
      return refSchema ? this.resolveSchema(refSchema, document) : {};
    }

    if (schema.example !== undefined) return schema.example;

    if (schema.properties) {
      return Object.entries(schema.properties).reduce(
        (acc: any, [key, prop]: [string, any]) => {
          acc[key] = this.resolveSchema(prop, document);
          return acc;
        },
        {},
      );
    }

    if (schema.type === 'array' && schema.items) {
      return [this.resolveSchema(schema.items, document)];
    }

    switch (schema.type) {
      case 'string':
        if (schema.format === 'uuid')
          return '00000000-0000-0000-0000-000000000000';
        if (schema.format === 'date-time') return new Date().toISOString();
        return 'string';
      case 'number':
      case 'integer':
        return 0;
      case 'boolean':
        return true;
      default:
        return null;
    }
  }
}
