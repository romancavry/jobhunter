import { Test, TestingModule } from '@nestjs/testing';
import { SourcesController } from './sources.controller.js';

describe('SourcesController', () => {
  let controller: SourcesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SourcesController],
    }).compile();

    controller = module.get<SourcesController>(SourcesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
