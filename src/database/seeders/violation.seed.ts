import { DataSource } from 'typeorm';

export async function seedViolations(dataSource: DataSource) {
  const categoryRepo = dataSource.getRepository('violation_categories');
  const itemRepo = dataSource.getRepository('violation_items');

  const categories = [
    { name: 'تخلفات مرتبط با خریدار', slug: 'buyer-related-violations' },
    { name: 'تخلفات مرتبط با فروشنده', slug: 'seller-related-violations' },
    { name: 'تخلفات در بخش نظرات', slug: 'comment-violations' },
    { name: 'تخلفات در ارتباط با پشتیبانی', slug: 'support-violations' },
    { name: 'تخلفات فنی و امنیتی', slug: 'technical-security-violations' },
  ];

  for (const cat of categories) {
    const exists = await categoryRepo.findOneBy({ slug: cat.slug });
    if (!exists) await categoryRepo.save(cat);
  }

  const items = [
    { name: 'لغو مکرر سفارش‌ها', slug: 'frequent-order-cancellations', categorySlug: 'buyer-related-violations', limit: 10, punishment: 'warning' },
    { name: 'فروش محصولات تقلبی', slug: 'selling-counterfeit-products', categorySlug: 'seller-related-violations', limit: null, punishment: 'permanent' },
    { name: 'توهین در نظرات محصولات', slug: 'insulting-in-product-comments', categorySlug: 'comment-violations', limit: null, punishment: 'temporary', duration: 3 },
  ];

  for (const item of items) {
    const category = await categoryRepo.findOneBy({ slug: item.categorySlug });
    if (category) {
      const exists = await itemRepo.findOneBy({ slug: item.slug });
      if (!exists) {
        await itemRepo.save({
          name: item.name,
          slug: item.slug,
          category,
          limit: item.limit,
          defaultPunishmentType: item.punishment,
          defaultDurationDays: item.duration || null,
        });
      }
    }
  }
}