import { AiDesignProviderFactory, type ProviderStatusInfo } from '../providers';
import { type ConfigureAiProvidersDto, type SessionUserDto } from '@toantrung/contracts';
import { prisma } from '@toantrung/database';

export async function getAiDesignStatus(): Promise<ProviderStatusInfo> {
  return AiDesignProviderFactory.getActiveProviderInfo();
}

export async function configureAiProviders(
  actor: SessionUserDto,
  input: ConfigureAiProvidersDto
): Promise<ProviderStatusInfo> {
  const updatedStatus = AiDesignProviderFactory.updateConfiguration(input);
  await prisma.auditLog.create({
    data: {
      actorUserId: actor.id,
      action: 'AI_DESIGN_PROVIDER_CONFIGURED',
      targetType: 'SystemSetting',
      targetId: input.defaultProviderId,
      detailsJson: JSON.stringify({
        defaultProviderId: input.defaultProviderId,
        defaultModelId: input.defaultModelId,
        autoFallbackToLocal: input.autoFallbackToLocal,
        configuredProvider: input.providerConfig?.providerId,
      }),
    },
  });
  return updatedStatus;
}
