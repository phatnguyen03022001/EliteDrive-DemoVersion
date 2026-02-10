import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import * as fs from 'fs';

export class SwaggerExporter {
  static exportApiMetadata(
    app: INestApplication,
    outputPath: string = './api-fields-report.json',
  ) {
    const config = new DocumentBuilder()
      .setTitle('API Specs')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config) as OpenAPIObject;
    const paths = document.paths;
    const schemas = (document.components?.schemas as any) || {};
    const apiReport = [];

    if (paths) {
      Object.keys(paths).forEach((path) => {
        const methods = paths[path];

        Object.keys(methods).forEach((method) => {
          const details = (methods as any)[method];

          // 1. Lấy thông tin từ Body
          const bodyContent =
            details.requestBody?.content?.['application/json'];
          const schemaRef = bodyContent?.schema?.$ref;
          let bodyFields = [];

          if (schemaRef) {
            const dtoName = schemaRef.split('/').pop();
            const schema = schemas[dtoName];
            if (schema) {
              const requiredList = schema.required || [];
              const properties = schema.properties || {};
              bodyFields = Object.keys(properties).map((prop) => ({
                name: prop,
                type: properties[prop].type || 'any',
                status: requiredList.includes(prop) ? 'REQUIRED' : 'OPTIONAL',
              }));
            }
          }

          // 2. Lấy thông tin từ Query Parameters
          const parameters = details.parameters || [];
          const queryFields = parameters
            .filter((p: any) => p.in === 'query')
            .map((p: any) => ({
              name: p.name,
              type: p.schema?.type || 'any',
              status: p.required ? 'REQUIRED' : 'OPTIONAL',
            }));

          apiReport.push({
            endpoint: path,
            method: method.toUpperCase(),
            summary: details.summary || '',
            bodyFields,
            queryFields,
          });
        });
      });
    }

    fs.writeFileSync(outputPath, JSON.stringify(apiReport, null, 2));
  }
}
