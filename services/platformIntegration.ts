import { ExternalPlatform, PlatformProgress } from '../types';
import { StorageService } from './storage';
import { EXTERNAL_PLATFORMS } from '../data/externalPlatforms';

const PLATFORM_PROGRESS_KEY = '@cyberlearn_platform_progress';

export class PlatformIntegrationService {
  static getPlatforms(): ExternalPlatform[] {
    return EXTERNAL_PLATFORMS;
  }

  static getPlatformById(id: string): ExternalPlatform | undefined {
    return EXTERNAL_PLATFORMS.find(p => p.id === id);
  }

  static async savePlatformProgress(progress: PlatformProgress): Promise<void> {
    try {
      const allProgress = await this.getPlatformProgress();
      const existingIndex = allProgress.findIndex(
        p => p.platformId === progress.platformId && p.username === progress.username
      );

      if (existingIndex >= 0) {
        allProgress[existingIndex] = progress;
      } else {
        allProgress.push(progress);
      }

      await StorageService.updatePreferences({ platformProgress: allProgress });
    } catch (error) {
      console.error('Error saving platform progress:', error);
    }
  }

  static async getPlatformProgress(): Promise<PlatformProgress[]> {
    try {
      const preferences = await StorageService.getUserPreferences();
      return (preferences as any)?.platformProgress || [];
    } catch (error) {
      console.error('Error getting platform progress:', error);
      return [];
    }
  }

  static async getProgressForPlatform(platformId: string): Promise<PlatformProgress | null> {
    const allProgress = await this.getPlatformProgress();
    return allProgress.find(p => p.platformId === platformId) || null;
  }

  static async deletePlatformProgress(platformId: string): Promise<void> {
    try {
      const allProgress = await this.getPlatformProgress();
      const updatedProgress = allProgress.filter(p => p.platformId !== platformId);
      
      await StorageService.updatePreferences({ platformProgress: updatedProgress });
    } catch (error) {
      console.error('Error deleting platform progress:', error);
    }
  }

  static getRecommendedPlatforms(careerPath: string): ExternalPlatform[] {
    const recommendations: Record<string, string[]> = {
      soc_analyst: ['tryhackme', 'letsdefend'],
      penetration_tester: ['hackthebox', 'tryhackme', 'portswigger'],
      grc_analyst: ['tryhackme'],
      cloud_security: ['tryhackme'],
      incident_responder: ['letsdefend', 'tryhackme'],
      detection_engineer: ['letsdefend', 'tryhackme'],
    };

    const platformIds = recommendations[careerPath] || ['tryhackme'];
    return platformIds
      .map(id => this.getPlatformById(id))
      .filter((p): p is ExternalPlatform => p !== undefined);
  }
}
