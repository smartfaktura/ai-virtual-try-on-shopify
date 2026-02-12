import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

// ── Models (44) ──
import m01 from '@/assets/models/model-female-athletic-american-black.jpg';
import m02 from '@/assets/models/model-female-athletic-american-brunette.jpg';
import m03 from '@/assets/models/model-female-athletic-black.jpg';
import m04 from '@/assets/models/model-female-athletic-european.jpg';
import m05 from '@/assets/models/model-female-athletic-indian.jpg';
import m06 from '@/assets/models/model-female-athletic-latina.jpg';
import m07 from '@/assets/models/model-female-athletic-mixed.jpg';
import m08 from '@/assets/models/model-female-average-african.jpg';
import m09 from '@/assets/models/model-female-average-american-redhead.jpg';
import m10 from '@/assets/models/model-female-average-european.jpg';
import m11 from '@/assets/models/model-female-average-irish.jpg';
import m12 from '@/assets/models/model-female-average-middleeast.jpg';
import m13 from '@/assets/models/model-female-average-nordic.jpg';
import m14 from '@/assets/models/model-female-mature-european.jpg';
import m15 from '@/assets/models/model-female-petite-korean.jpg';
import m16 from '@/assets/models/model-female-plussize-african.jpg';
import m17 from '@/assets/models/model-female-plussize-japanese.jpg';
import m18 from '@/assets/models/model-female-plussize-latina.jpg';
import m19 from '@/assets/models/model-female-plussize-middleeast.jpg';
import m20 from '@/assets/models/model-female-slim-american-blonde.jpg';
import m21 from '@/assets/models/model-female-slim-american-latina.jpg';
import m22 from '@/assets/models/model-female-slim-asian.jpg';
import m23 from '@/assets/models/model-female-slim-chinese.jpg';
import m24 from '@/assets/models/model-female-slim-nordic.jpg';
import m25 from '@/assets/models/model-male-athletic-american-classic.jpg';
import m26 from '@/assets/models/model-male-athletic-american-mixed.jpg';
import m27 from '@/assets/models/model-male-athletic-american.jpg';
import m28 from '@/assets/models/model-male-athletic-black.jpg';
import m29 from '@/assets/models/model-male-athletic-european.jpg';
import m30 from '@/assets/models/model-male-athletic-japanese.jpg';
import m31 from '@/assets/models/model-male-athletic-latino.jpg';
import m32 from '@/assets/models/model-male-athletic-mixed.jpg';
import m33 from '@/assets/models/model-male-athletic-scottish.jpg';
import m34 from '@/assets/models/model-male-average-american-beard.jpg';
import m35 from '@/assets/models/model-male-average-asian.jpg';
import m36 from '@/assets/models/model-male-average-chinese.jpg';
import m37 from '@/assets/models/model-male-average-latino.jpg';
import m38 from '@/assets/models/model-male-plussize-african.jpg';
import m39 from '@/assets/models/model-male-plussize-european.jpg';
import m40 from '@/assets/models/model-male-plussize-latino.jpg';
import m41 from '@/assets/models/model-male-slim-american-blonde.jpg';
import m42 from '@/assets/models/model-male-slim-indian.jpg';
import m43 from '@/assets/models/model-male-slim-middleeast.jpg';
import m44 from '@/assets/models/model-male-slim-nordic.jpg';

// ── Poses (54) ──
import p01 from '@/assets/poses/pose-editorial-artistic-male.jpg';
import p02 from '@/assets/poses/pose-editorial-artistic.jpg';
import p03 from '@/assets/poses/pose-editorial-dramatic-male.jpg';
import p04 from '@/assets/poses/pose-editorial-dramatic.jpg';
import p05 from '@/assets/poses/pose-editorial-gallery-male.jpg';
import p06 from '@/assets/poses/pose-editorial-minimal-male.jpg';
import p07 from '@/assets/poses/pose-editorial-minimal.jpg';
import p08 from '@/assets/poses/pose-editorial-moody-male.jpg';
import p09 from '@/assets/poses/pose-editorial-moody.jpg';
import p10 from '@/assets/poses/pose-editorial-motion-male.jpg';
import p11 from '@/assets/poses/pose-editorial-motion.jpg';
import p12 from '@/assets/poses/pose-editorial-warehouse-male.jpg';
import p13 from '@/assets/poses/pose-editorial-window-male.jpg';
import p14 from '@/assets/poses/pose-editorial-window.jpg';
import p15 from '@/assets/poses/pose-lifestyle-autumn-male.jpg';
import p16 from '@/assets/poses/pose-lifestyle-beach-male.jpg';
import p17 from '@/assets/poses/pose-lifestyle-beach.jpg';
import p18 from '@/assets/poses/pose-lifestyle-coffee-male.jpg';
import p19 from '@/assets/poses/pose-lifestyle-coffee.jpg';
import p20 from '@/assets/poses/pose-lifestyle-garden-male.jpg';
import p21 from '@/assets/poses/pose-lifestyle-garden.jpg';
import p22 from '@/assets/poses/pose-lifestyle-gym-male.jpg';
import p23 from '@/assets/poses/pose-lifestyle-park-male.jpg';
import p24 from '@/assets/poses/pose-lifestyle-park.jpg';
import p25 from '@/assets/poses/pose-lifestyle-resort-male.jpg';
import p26 from '@/assets/poses/pose-lifestyle-rooftop-male.jpg';
import p27 from '@/assets/poses/pose-lifestyle-rooftop.jpg';
import p28 from '@/assets/poses/pose-lifestyle-seated-male.jpg';
import p29 from '@/assets/poses/pose-lifestyle-seated.jpg';
import p30 from '@/assets/poses/pose-lifestyle-walking-male.jpg';
import p31 from '@/assets/poses/pose-lifestyle-walking.jpg';
import p32 from '@/assets/poses/pose-streetwear-basketball-male.jpg';
import p33 from '@/assets/poses/pose-streetwear-basketball.jpg';
import p34 from '@/assets/poses/pose-streetwear-neon-male.jpg';
import p35 from '@/assets/poses/pose-streetwear-neon.jpg';
import p36 from '@/assets/poses/pose-streetwear-shopping-male.jpg';
import p37 from '@/assets/poses/pose-streetwear-stairs-male.jpg';
import p38 from '@/assets/poses/pose-streetwear-stairs.jpg';
import p39 from '@/assets/poses/pose-streetwear-underpass-male.jpg';
import p40 from '@/assets/poses/pose-streetwear-underpass.jpg';
import p41 from '@/assets/poses/pose-streetwear-urban-male.jpg';
import p42 from '@/assets/poses/pose-streetwear-urban.jpg';
import p43 from '@/assets/poses/pose-studio-arms-male.jpg';
import p44 from '@/assets/poses/pose-studio-arms.jpg';
import p45 from '@/assets/poses/pose-studio-back-male.jpg';
import p46 from '@/assets/poses/pose-studio-back.jpg';
import p47 from '@/assets/poses/pose-studio-closeup-male.jpg';
import p48 from '@/assets/poses/pose-studio-closeup.jpg';
import p49 from '@/assets/poses/pose-studio-front-male.jpg';
import p50 from '@/assets/poses/pose-studio-front.jpg';
import p51 from '@/assets/poses/pose-studio-movement-male.jpg';
import p52 from '@/assets/poses/pose-studio-movement.jpg';
import p53 from '@/assets/poses/pose-studio-profile-male.jpg';
import p54 from '@/assets/poses/pose-studio-profile.jpg';

// ── Products (32) ──
import pr01 from '@/assets/products/avoid-cropped.jpg';
import pr02 from '@/assets/products/avoid-flatlay.jpg';
import pr03 from '@/assets/products/avoid-lowcontrast.jpg';
import pr04 from '@/assets/products/candle-soy.jpg';
import pr05 from '@/assets/products/carafe-ceramic.jpg';
import pr06 from '@/assets/products/chocolate-artisan.jpg';
import pr07 from '@/assets/products/coffee-beans.jpg';
import pr08 from '@/assets/products/collagen-powder.jpg';
import pr09 from '@/assets/products/cream-hyaluronic.jpg';
import pr10 from '@/assets/products/cropped-longsleeve-1.jpg';
import pr11 from '@/assets/products/faux-fur-jacket-1.jpg';
import pr12 from '@/assets/products/granola-organic.jpg';
import pr13 from '@/assets/products/greens-superfood.jpg';
import pr14 from '@/assets/products/honey-organic.jpg';
import pr15 from '@/assets/products/hoodie-gray-1.jpg';
import pr16 from '@/assets/products/joggers-beige-1.jpg';
import pr17 from '@/assets/products/juice-green.jpg';
import pr18 from '@/assets/products/lamp-brass.jpg';
import pr19 from '@/assets/products/leggings-black-1.jpg';
import pr20 from '@/assets/products/leggings-pink-1.jpg';
import pr21 from '@/assets/products/lipstick-matte.jpg';
import pr22 from '@/assets/products/magnesium-capsules.jpg';
import pr23 from '@/assets/products/moto-leggings-1.jpg';
import pr24 from '@/assets/products/omega-fish-oil.jpg';
import pr25 from '@/assets/products/pillow-linen.jpg';
import pr26 from '@/assets/products/planter-concrete.jpg';
import pr27 from '@/assets/products/powder-setting.jpg';
import pr28 from '@/assets/products/retinol-treatment.jpg';
import pr29 from '@/assets/products/serum-vitamin-c.jpg';
import pr30 from '@/assets/products/sports-bra-black-1.jpg';
import pr31 from '@/assets/products/tank-white-1.jpg';
import pr32 from '@/assets/products/vitamins-gummy.jpg';

// ── Showcase (35) ──
import s01 from '@/assets/showcase/fashion-activewear-bright.jpg';
import s02 from '@/assets/showcase/fashion-activewear-studio.jpg';
import s03 from '@/assets/showcase/fashion-blazer-golden.jpg';
import s04 from '@/assets/showcase/fashion-blazer-street.jpg';
import s05 from '@/assets/showcase/fashion-cashmere-cafe.jpg';
import s06 from '@/assets/showcase/fashion-dress-botanical.jpg';
import s07 from '@/assets/showcase/fashion-dress-garden.jpg';
import s08 from '@/assets/showcase/fashion-street-denim.jpg';
import s09 from '@/assets/showcase/fashion-streetwear-urban.jpg';
import s10 from '@/assets/showcase/food-acai-bright.jpg';
import s11 from '@/assets/showcase/food-bread-bakery.jpg';
import s12 from '@/assets/showcase/food-coffee-artisan.jpg';
import s13 from '@/assets/showcase/food-coffee-pourover.jpg';
import s14 from '@/assets/showcase/food-honey-farmhouse.jpg';
import s15 from '@/assets/showcase/food-honey-golden.jpg';
import s16 from '@/assets/showcase/food-pasta-artisan.jpg';
import s17 from '@/assets/showcase/food-pasta-rustic.jpg';
import s18 from '@/assets/showcase/food-smoothie-bright.jpg';
import s19 from '@/assets/showcase/home-bedroom-morning.jpg';
import s20 from '@/assets/showcase/home-candle-evening.jpg';
import s21 from '@/assets/showcase/home-candle-scandi.jpg';
import s22 from '@/assets/showcase/home-lamp-desk.jpg';
import s23 from '@/assets/showcase/home-lamp-evening.jpg';
import s24 from '@/assets/showcase/home-pendant-kitchen.jpg';
import s25 from '@/assets/showcase/home-textiles-bedroom.jpg';
import s26 from '@/assets/showcase/home-vases-japandi.jpg';
import s27 from '@/assets/showcase/home-vases-shelf.jpg';
import s28 from '@/assets/showcase/skincare-cream-botanical.jpg';
import s29 from '@/assets/showcase/skincare-cream-moody.jpg';
import s30 from '@/assets/showcase/skincare-oil-bathroom.jpg';
import s31 from '@/assets/showcase/skincare-oil-lifestyle.jpg';
import s32 from '@/assets/showcase/skincare-retinol-model.jpg';
import s33 from '@/assets/showcase/skincare-serum-marble.jpg';
import s34 from '@/assets/showcase/skincare-serum-morning.jpg';
import s35 from '@/assets/showcase/skincare-set-minimal.jpg';

// ── Drops (32) ──
import d01 from '@/assets/drops/drop-june-1.jpg';
import d02 from '@/assets/drops/drop-june-2.jpg';
import d03 from '@/assets/drops/drop-june-3.jpg';
import d04 from '@/assets/drops/drop-june-4.jpg';
import d05 from '@/assets/drops/drop-june-portrait-1.jpg';
import d06 from '@/assets/drops/drop-june-portrait-2.jpg';
import d07 from '@/assets/drops/drop-june-portrait-3.jpg';
import d08 from '@/assets/drops/drop-model-black-tank.jpg';
import d09 from '@/assets/drops/drop-model-burgundy-top.jpg';
import d10 from '@/assets/drops/drop-model-camel-pullover.jpg';
import d11 from '@/assets/drops/drop-model-charcoal-jacket.jpg';
import d12 from '@/assets/drops/drop-model-cream-bodysuit.jpg';
import d13 from '@/assets/drops/drop-model-emerald-set.jpg';
import d14 from '@/assets/drops/drop-model-lavender-set.jpg';
import d15 from '@/assets/drops/drop-model-navy-jacket.jpg';
import d16 from '@/assets/drops/drop-model-pink-hoodie.jpg';
import d17 from '@/assets/drops/drop-model-sage-set.jpg';
import d18 from '@/assets/drops/drop-model-white-crop.jpg';
import d19 from '@/assets/drops/drop-nov-1.jpg';
import d20 from '@/assets/drops/drop-nov-2.jpg';
import d21 from '@/assets/drops/drop-nov-3.jpg';
import d22 from '@/assets/drops/drop-nov-4.jpg';
import d23 from '@/assets/drops/drop-nov-portrait-1.jpg';
import d24 from '@/assets/drops/drop-nov-portrait-2.jpg';
import d25 from '@/assets/drops/drop-nov-portrait-3.jpg';
import d26 from '@/assets/drops/drop-sept-1.jpg';
import d27 from '@/assets/drops/drop-sept-2.jpg';
import d28 from '@/assets/drops/drop-sept-3.jpg';
import d29 from '@/assets/drops/drop-sept-4.jpg';
import d30 from '@/assets/drops/drop-sept-portrait-1.jpg';
import d31 from '@/assets/drops/drop-sept-portrait-2.jpg';
import d32 from '@/assets/drops/drop-sept-portrait-3.jpg';

// ── Hero (33) ──
import h01 from '@/assets/hero/hero-generate-outcome.jpg';
import h02 from '@/assets/hero/hero-model-blonde.jpg';
import h03 from '@/assets/hero/hero-output-beach.jpg';
import h04 from '@/assets/hero/hero-output-coffee.jpg';
import h05 from '@/assets/hero/hero-output-home.jpg';
import h06 from '@/assets/hero/hero-output-park.jpg';
import h07 from '@/assets/hero/hero-output-rooftop.jpg';
import h08 from '@/assets/hero/hero-output-studio.jpg';
import h09 from '@/assets/hero/hero-output-urban.jpg';
import h10 from '@/assets/hero/hero-output-yoga-result.jpg';
import h11 from '@/assets/hero/hero-output-yoga.jpg';
import h12 from '@/assets/hero/hero-product-croptop.jpg';
import h13 from '@/assets/hero/hero-product-ring.jpg';
import h14 from '@/assets/hero/hero-product-serum.jpg';
import h15 from '@/assets/hero/hero-product-tshirt.jpg';
import h16 from '@/assets/hero/hero-result-yoga-blonde.jpg';
import h17 from '@/assets/hero/hero-ring-flatlay.jpg';
import h18 from '@/assets/hero/hero-ring-golden.jpg';
import h19 from '@/assets/hero/hero-ring-macro.jpg';
import h20 from '@/assets/hero/hero-ring-model1.jpg';
import h21 from '@/assets/hero/hero-ring-model2.jpg';
import h22 from '@/assets/hero/hero-ring-model3.jpg';
import h23 from '@/assets/hero/hero-ring-velvet.jpg';
import h24 from '@/assets/hero/hero-ring-water.jpg';
import h25 from '@/assets/hero/hero-scene-yoga.jpg';
import h26 from '@/assets/hero/hero-serum-bathroom.jpg';
import h27 from '@/assets/hero/hero-serum-flatlay.jpg';
import h28 from '@/assets/hero/hero-serum-garden.jpg';
import h29 from '@/assets/hero/hero-serum-moody.jpg';
import h30 from '@/assets/hero/hero-serum-shadows.jpg';
import h31 from '@/assets/hero/hero-serum-shelf.jpg';
import h32 from '@/assets/hero/hero-serum-studio.jpg';
import h33 from '@/assets/hero/hero-serum-table.jpg';

// ── Team (10) ──
import t01 from '@/assets/team/avatar-amara.jpg';
import t02 from '@/assets/team/avatar-kenji.jpg';
import t03 from '@/assets/team/avatar-leo.jpg';
import t04 from '@/assets/team/avatar-luna.jpg';
import t05 from '@/assets/team/avatar-max.jpg';
import t06 from '@/assets/team/avatar-omar.jpg';
import t07 from '@/assets/team/avatar-sienna.jpg';
import t08 from '@/assets/team/avatar-sophia.jpg';
import t09 from '@/assets/team/avatar-yuki.jpg';
import t10 from '@/assets/team/avatar-zara.jpg';

// ── Templates (17) ──
import tp01 from '@/assets/templates/clothing-flatlay.jpg';
import tp02 from '@/assets/templates/clothing-streetwear.jpg';
import tp03 from '@/assets/templates/clothing-studio.jpg';
import tp04 from '@/assets/templates/cosmetics-luxury.jpg';
import tp05 from '@/assets/templates/cosmetics-pastel.jpg';
import tp06 from '@/assets/templates/cosmetics-water.jpg';
import tp07 from '@/assets/templates/food-commercial.jpg';
import tp08 from '@/assets/templates/food-packaging.jpg';
import tp09 from '@/assets/templates/food-rustic.jpg';
import tp10 from '@/assets/templates/home-concrete.jpg';
import tp11 from '@/assets/templates/home-japandi.jpg';
import tp12 from '@/assets/templates/home-warm.jpg';
import tp13 from '@/assets/templates/supplements-athletic.jpg';
import tp14 from '@/assets/templates/supplements-clinical.jpg';
import tp15 from '@/assets/templates/supplements-luxury.jpg';
import tp16 from '@/assets/templates/universal-clean.jpg';
import tp17 from '@/assets/templates/universal-gradient.jpg';

// ── Features (5) ──
import f01 from '@/assets/features/feature-ai-models.jpg';
import f02 from '@/assets/features/feature-auto-drops.jpg';
import f03 from '@/assets/features/feature-brand-memory.jpg';
import f04 from '@/assets/features/feature-campaigns.jpg';
import f05 from '@/assets/features/feature-tryon.jpg';

// ── Workflows (6) ──
import w01 from '@/assets/workflows/workflow-flat-lay.jpg';
import w02 from '@/assets/workflows/workflow-product-listing.jpg';
import w03 from '@/assets/workflows/workflow-selfie-ugc.jpg';
import w04 from '@/assets/workflows/workflow-tryon-product-flatlay.png';
import w05 from '@/assets/workflows/workflow-tryon-result.png';
import w06 from '@/assets/workflows/workflow-virtual-tryon.jpg';

// Map of storage path → bundled URL
const ASSET_MANIFEST: Record<string, string> = {
  // Models
  'models/model-female-athletic-american-black.jpg': m01,
  'models/model-female-athletic-american-brunette.jpg': m02,
  'models/model-female-athletic-black.jpg': m03,
  'models/model-female-athletic-european.jpg': m04,
  'models/model-female-athletic-indian.jpg': m05,
  'models/model-female-athletic-latina.jpg': m06,
  'models/model-female-athletic-mixed.jpg': m07,
  'models/model-female-average-african.jpg': m08,
  'models/model-female-average-american-redhead.jpg': m09,
  'models/model-female-average-european.jpg': m10,
  'models/model-female-average-irish.jpg': m11,
  'models/model-female-average-middleeast.jpg': m12,
  'models/model-female-average-nordic.jpg': m13,
  'models/model-female-mature-european.jpg': m14,
  'models/model-female-petite-korean.jpg': m15,
  'models/model-female-plussize-african.jpg': m16,
  'models/model-female-plussize-japanese.jpg': m17,
  'models/model-female-plussize-latina.jpg': m18,
  'models/model-female-plussize-middleeast.jpg': m19,
  'models/model-female-slim-american-blonde.jpg': m20,
  'models/model-female-slim-american-latina.jpg': m21,
  'models/model-female-slim-asian.jpg': m22,
  'models/model-female-slim-chinese.jpg': m23,
  'models/model-female-slim-nordic.jpg': m24,
  'models/model-male-athletic-american-classic.jpg': m25,
  'models/model-male-athletic-american-mixed.jpg': m26,
  'models/model-male-athletic-american.jpg': m27,
  'models/model-male-athletic-black.jpg': m28,
  'models/model-male-athletic-european.jpg': m29,
  'models/model-male-athletic-japanese.jpg': m30,
  'models/model-male-athletic-latino.jpg': m31,
  'models/model-male-athletic-mixed.jpg': m32,
  'models/model-male-athletic-scottish.jpg': m33,
  'models/model-male-average-american-beard.jpg': m34,
  'models/model-male-average-asian.jpg': m35,
  'models/model-male-average-chinese.jpg': m36,
  'models/model-male-average-latino.jpg': m37,
  'models/model-male-plussize-african.jpg': m38,
  'models/model-male-plussize-european.jpg': m39,
  'models/model-male-plussize-latino.jpg': m40,
  'models/model-male-slim-american-blonde.jpg': m41,
  'models/model-male-slim-indian.jpg': m42,
  'models/model-male-slim-middleeast.jpg': m43,
  'models/model-male-slim-nordic.jpg': m44,

  // Poses
  'poses/pose-editorial-artistic-male.jpg': p01,
  'poses/pose-editorial-artistic.jpg': p02,
  'poses/pose-editorial-dramatic-male.jpg': p03,
  'poses/pose-editorial-dramatic.jpg': p04,
  'poses/pose-editorial-gallery-male.jpg': p05,
  'poses/pose-editorial-minimal-male.jpg': p06,
  'poses/pose-editorial-minimal.jpg': p07,
  'poses/pose-editorial-moody-male.jpg': p08,
  'poses/pose-editorial-moody.jpg': p09,
  'poses/pose-editorial-motion-male.jpg': p10,
  'poses/pose-editorial-motion.jpg': p11,
  'poses/pose-editorial-warehouse-male.jpg': p12,
  'poses/pose-editorial-window-male.jpg': p13,
  'poses/pose-editorial-window.jpg': p14,
  'poses/pose-lifestyle-autumn-male.jpg': p15,
  'poses/pose-lifestyle-beach-male.jpg': p16,
  'poses/pose-lifestyle-beach.jpg': p17,
  'poses/pose-lifestyle-coffee-male.jpg': p18,
  'poses/pose-lifestyle-coffee.jpg': p19,
  'poses/pose-lifestyle-garden-male.jpg': p20,
  'poses/pose-lifestyle-garden.jpg': p21,
  'poses/pose-lifestyle-gym-male.jpg': p22,
  'poses/pose-lifestyle-park-male.jpg': p23,
  'poses/pose-lifestyle-park.jpg': p24,
  'poses/pose-lifestyle-resort-male.jpg': p25,
  'poses/pose-lifestyle-rooftop-male.jpg': p26,
  'poses/pose-lifestyle-rooftop.jpg': p27,
  'poses/pose-lifestyle-seated-male.jpg': p28,
  'poses/pose-lifestyle-seated.jpg': p29,
  'poses/pose-lifestyle-walking-male.jpg': p30,
  'poses/pose-lifestyle-walking.jpg': p31,
  'poses/pose-streetwear-basketball-male.jpg': p32,
  'poses/pose-streetwear-basketball.jpg': p33,
  'poses/pose-streetwear-neon-male.jpg': p34,
  'poses/pose-streetwear-neon.jpg': p35,
  'poses/pose-streetwear-shopping-male.jpg': p36,
  'poses/pose-streetwear-stairs-male.jpg': p37,
  'poses/pose-streetwear-stairs.jpg': p38,
  'poses/pose-streetwear-underpass-male.jpg': p39,
  'poses/pose-streetwear-underpass.jpg': p40,
  'poses/pose-streetwear-urban-male.jpg': p41,
  'poses/pose-streetwear-urban.jpg': p42,
  'poses/pose-studio-arms-male.jpg': p43,
  'poses/pose-studio-arms.jpg': p44,
  'poses/pose-studio-back-male.jpg': p45,
  'poses/pose-studio-back.jpg': p46,
  'poses/pose-studio-closeup-male.jpg': p47,
  'poses/pose-studio-closeup.jpg': p48,
  'poses/pose-studio-front-male.jpg': p49,
  'poses/pose-studio-front.jpg': p50,
  'poses/pose-studio-movement-male.jpg': p51,
  'poses/pose-studio-movement.jpg': p52,
  'poses/pose-studio-profile-male.jpg': p53,
  'poses/pose-studio-profile.jpg': p54,

  // Products
  'products/avoid-cropped.jpg': pr01,
  'products/avoid-flatlay.jpg': pr02,
  'products/avoid-lowcontrast.jpg': pr03,
  'products/candle-soy.jpg': pr04,
  'products/carafe-ceramic.jpg': pr05,
  'products/chocolate-artisan.jpg': pr06,
  'products/coffee-beans.jpg': pr07,
  'products/collagen-powder.jpg': pr08,
  'products/cream-hyaluronic.jpg': pr09,
  'products/cropped-longsleeve-1.jpg': pr10,
  'products/faux-fur-jacket-1.jpg': pr11,
  'products/granola-organic.jpg': pr12,
  'products/greens-superfood.jpg': pr13,
  'products/honey-organic.jpg': pr14,
  'products/hoodie-gray-1.jpg': pr15,
  'products/joggers-beige-1.jpg': pr16,
  'products/juice-green.jpg': pr17,
  'products/lamp-brass.jpg': pr18,
  'products/leggings-black-1.jpg': pr19,
  'products/leggings-pink-1.jpg': pr20,
  'products/lipstick-matte.jpg': pr21,
  'products/magnesium-capsules.jpg': pr22,
  'products/moto-leggings-1.jpg': pr23,
  'products/omega-fish-oil.jpg': pr24,
  'products/pillow-linen.jpg': pr25,
  'products/planter-concrete.jpg': pr26,
  'products/powder-setting.jpg': pr27,
  'products/retinol-treatment.jpg': pr28,
  'products/serum-vitamin-c.jpg': pr29,
  'products/sports-bra-black-1.jpg': pr30,
  'products/tank-white-1.jpg': pr31,
  'products/vitamins-gummy.jpg': pr32,

  // Showcase
  'showcase/fashion-activewear-bright.jpg': s01,
  'showcase/fashion-activewear-studio.jpg': s02,
  'showcase/fashion-blazer-golden.jpg': s03,
  'showcase/fashion-blazer-street.jpg': s04,
  'showcase/fashion-cashmere-cafe.jpg': s05,
  'showcase/fashion-dress-botanical.jpg': s06,
  'showcase/fashion-dress-garden.jpg': s07,
  'showcase/fashion-street-denim.jpg': s08,
  'showcase/fashion-streetwear-urban.jpg': s09,
  'showcase/food-acai-bright.jpg': s10,
  'showcase/food-bread-bakery.jpg': s11,
  'showcase/food-coffee-artisan.jpg': s12,
  'showcase/food-coffee-pourover.jpg': s13,
  'showcase/food-honey-farmhouse.jpg': s14,
  'showcase/food-honey-golden.jpg': s15,
  'showcase/food-pasta-artisan.jpg': s16,
  'showcase/food-pasta-rustic.jpg': s17,
  'showcase/food-smoothie-bright.jpg': s18,
  'showcase/home-bedroom-morning.jpg': s19,
  'showcase/home-candle-evening.jpg': s20,
  'showcase/home-candle-scandi.jpg': s21,
  'showcase/home-lamp-desk.jpg': s22,
  'showcase/home-lamp-evening.jpg': s23,
  'showcase/home-pendant-kitchen.jpg': s24,
  'showcase/home-textiles-bedroom.jpg': s25,
  'showcase/home-vases-japandi.jpg': s26,
  'showcase/home-vases-shelf.jpg': s27,
  'showcase/skincare-cream-botanical.jpg': s28,
  'showcase/skincare-cream-moody.jpg': s29,
  'showcase/skincare-oil-bathroom.jpg': s30,
  'showcase/skincare-oil-lifestyle.jpg': s31,
  'showcase/skincare-retinol-model.jpg': s32,
  'showcase/skincare-serum-marble.jpg': s33,
  'showcase/skincare-serum-morning.jpg': s34,
  'showcase/skincare-set-minimal.jpg': s35,

  // Drops
  'drops/drop-june-1.jpg': d01,
  'drops/drop-june-2.jpg': d02,
  'drops/drop-june-3.jpg': d03,
  'drops/drop-june-4.jpg': d04,
  'drops/drop-june-portrait-1.jpg': d05,
  'drops/drop-june-portrait-2.jpg': d06,
  'drops/drop-june-portrait-3.jpg': d07,
  'drops/drop-model-black-tank.jpg': d08,
  'drops/drop-model-burgundy-top.jpg': d09,
  'drops/drop-model-camel-pullover.jpg': d10,
  'drops/drop-model-charcoal-jacket.jpg': d11,
  'drops/drop-model-cream-bodysuit.jpg': d12,
  'drops/drop-model-emerald-set.jpg': d13,
  'drops/drop-model-lavender-set.jpg': d14,
  'drops/drop-model-navy-jacket.jpg': d15,
  'drops/drop-model-pink-hoodie.jpg': d16,
  'drops/drop-model-sage-set.jpg': d17,
  'drops/drop-model-white-crop.jpg': d18,
  'drops/drop-nov-1.jpg': d19,
  'drops/drop-nov-2.jpg': d20,
  'drops/drop-nov-3.jpg': d21,
  'drops/drop-nov-4.jpg': d22,
  'drops/drop-nov-portrait-1.jpg': d23,
  'drops/drop-nov-portrait-2.jpg': d24,
  'drops/drop-nov-portrait-3.jpg': d25,
  'drops/drop-sept-1.jpg': d26,
  'drops/drop-sept-2.jpg': d27,
  'drops/drop-sept-3.jpg': d28,
  'drops/drop-sept-4.jpg': d29,
  'drops/drop-sept-portrait-1.jpg': d30,
  'drops/drop-sept-portrait-2.jpg': d31,
  'drops/drop-sept-portrait-3.jpg': d32,

  // Hero
  'hero/hero-generate-outcome.jpg': h01,
  'hero/hero-model-blonde.jpg': h02,
  'hero/hero-output-beach.jpg': h03,
  'hero/hero-output-coffee.jpg': h04,
  'hero/hero-output-home.jpg': h05,
  'hero/hero-output-park.jpg': h06,
  'hero/hero-output-rooftop.jpg': h07,
  'hero/hero-output-studio.jpg': h08,
  'hero/hero-output-urban.jpg': h09,
  'hero/hero-output-yoga-result.jpg': h10,
  'hero/hero-output-yoga.jpg': h11,
  'hero/hero-product-croptop.jpg': h12,
  'hero/hero-product-ring.jpg': h13,
  'hero/hero-product-serum.jpg': h14,
  'hero/hero-product-tshirt.jpg': h15,
  'hero/hero-result-yoga-blonde.jpg': h16,
  'hero/hero-ring-flatlay.jpg': h17,
  'hero/hero-ring-golden.jpg': h18,
  'hero/hero-ring-macro.jpg': h19,
  'hero/hero-ring-model1.jpg': h20,
  'hero/hero-ring-model2.jpg': h21,
  'hero/hero-ring-model3.jpg': h22,
  'hero/hero-ring-velvet.jpg': h23,
  'hero/hero-ring-water.jpg': h24,
  'hero/hero-scene-yoga.jpg': h25,
  'hero/hero-serum-bathroom.jpg': h26,
  'hero/hero-serum-flatlay.jpg': h27,
  'hero/hero-serum-garden.jpg': h28,
  'hero/hero-serum-moody.jpg': h29,
  'hero/hero-serum-shadows.jpg': h30,
  'hero/hero-serum-shelf.jpg': h31,
  'hero/hero-serum-studio.jpg': h32,
  'hero/hero-serum-table.jpg': h33,

  // Team
  'team/avatar-amara.jpg': t01,
  'team/avatar-kenji.jpg': t02,
  'team/avatar-leo.jpg': t03,
  'team/avatar-luna.jpg': t04,
  'team/avatar-max.jpg': t05,
  'team/avatar-omar.jpg': t06,
  'team/avatar-sienna.jpg': t07,
  'team/avatar-sophia.jpg': t08,
  'team/avatar-yuki.jpg': t09,
  'team/avatar-zara.jpg': t10,

  // Templates
  'templates/clothing-flatlay.jpg': tp01,
  'templates/clothing-streetwear.jpg': tp02,
  'templates/clothing-studio.jpg': tp03,
  'templates/cosmetics-luxury.jpg': tp04,
  'templates/cosmetics-pastel.jpg': tp05,
  'templates/cosmetics-water.jpg': tp06,
  'templates/food-commercial.jpg': tp07,
  'templates/food-packaging.jpg': tp08,
  'templates/food-rustic.jpg': tp09,
  'templates/home-concrete.jpg': tp10,
  'templates/home-japandi.jpg': tp11,
  'templates/home-warm.jpg': tp12,
  'templates/supplements-athletic.jpg': tp13,
  'templates/supplements-clinical.jpg': tp14,
  'templates/supplements-luxury.jpg': tp15,
  'templates/universal-clean.jpg': tp16,
  'templates/universal-gradient.jpg': tp17,

  // Features
  'features/feature-ai-models.jpg': f01,
  'features/feature-auto-drops.jpg': f02,
  'features/feature-brand-memory.jpg': f03,
  'features/feature-campaigns.jpg': f04,
  'features/feature-tryon.jpg': f05,

  // Workflows
  'workflows/workflow-flat-lay.jpg': w01,
  'workflows/workflow-product-listing.jpg': w02,
  'workflows/workflow-selfie-ugc.jpg': w03,
  'workflows/workflow-tryon-product-flatlay.png': w04,
  'workflows/workflow-tryon-result.png': w05,
  'workflows/workflow-virtual-tryon.jpg': w06,
};

interface UploadResult {
  path: string;
  status: 'success' | 'error' | 'skipped';
  message?: string;
}

export default function AssetMigration() {
  const [results, setResults] = useState<UploadResult[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const abortRef = useRef(false);

  const total = Object.keys(ASSET_MANIFEST).length;

  async function uploadAsset(storagePath: string, bundledUrl: string): Promise<UploadResult> {
    try {
      // Check if file already exists
      const { data: existing } = await supabase.storage
        .from('landing-assets')
        .list(storagePath.split('/').slice(0, -1).join('/'), {
          search: storagePath.split('/').pop(),
        });

      if (existing && existing.length > 0) {
        return { path: storagePath, status: 'skipped', message: 'Already exists' };
      }

      // Fetch the bundled image
      const response = await fetch(bundledUrl);
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
      const blob = await response.blob();

      // Determine content type
      const ext = storagePath.split('.').pop()?.toLowerCase();
      const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

      // Upload to storage
      const { error } = await supabase.storage
        .from('landing-assets')
        .upload(storagePath, blob, {
          contentType,
          upsert: true,
        });

      if (error) throw error;

      return { path: storagePath, status: 'success' };
    } catch (err: any) {
      return { path: storagePath, status: 'error', message: err.message };
    }
  }

  async function runMigration() {
    setRunning(true);
    setResults([]);
    abortRef.current = false;
    const entries = Object.entries(ASSET_MANIFEST);
    setProgress({ done: 0, total: entries.length });

    // Process 3 at a time for speed without overwhelming the server
    const batchSize = 3;
    for (let i = 0; i < entries.length; i += batchSize) {
      if (abortRef.current) break;
      const batch = entries.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(([path, url]) => uploadAsset(path, url))
      );
      setResults((prev) => [...prev, ...batchResults]);
      setProgress((prev) => ({ ...prev, done: Math.min(prev.done + batchSize, entries.length) }));
    }

    setRunning(false);
  }

  const successCount = results.filter((r) => r.status === 'success').length;
  const errorCount = results.filter((r) => r.status === 'error').length;
  const skippedCount = results.filter((r) => r.status === 'skipped').length;

  return (
    <div className="min-h-screen bg-background p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-2">Asset Migration</h1>
      <p className="text-muted-foreground mb-6">
        Upload {total} static landing page images to storage. One-time operation.
      </p>

      <div className="flex gap-3 mb-8">
        <Button onClick={runMigration} disabled={running} size="lg">
          {running ? 'Uploading...' : 'Start Migration'}
        </Button>
        {running && (
          <Button variant="destructive" onClick={() => { abortRef.current = true; }}>
            Stop
          </Button>
        )}
      </div>

      {/* Progress */}
      {progress.total > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>{progress.done} / {progress.total}</span>
            <span>{Math.round((progress.done / progress.total) * 100)}%</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-green-600">✓ {successCount}</span>
            <span className="text-yellow-600">⊘ {skippedCount}</span>
            <span className="text-red-600">✕ {errorCount}</span>
          </div>
        </div>
      )}

      {/* Results log */}
      {results.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="text-left p-2 font-medium text-foreground">Path</th>
                  <th className="text-left p-2 font-medium text-foreground w-24">Status</th>
                  <th className="text-left p-2 font-medium text-foreground">Message</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.path} className="border-t border-border">
                    <td className="p-2 text-muted-foreground font-mono text-xs">{r.path}</td>
                    <td className="p-2">
                      <span className={`text-xs font-medium ${
                        r.status === 'success' ? 'text-green-600' :
                        r.status === 'skipped' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-2 text-xs text-muted-foreground">{r.message || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
