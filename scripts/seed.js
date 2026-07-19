import 'dotenv/config';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Missing Supabase credentials. Set SUPABASE_URL or VITE_SUPABASE_URL, plus SUPABASE_SERVICE_ROLE_KEY in .env.'
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const seedCategoryNames = [
  'Breakfast',
  'Main Course',
  'Dessert',
  'Salad',
  'Soup',
  'Vegan',
];

const seedRecipes = [
  {
    title: 'Fluffy Ricotta Pancakes',
    category: 'Breakfast',
    ownerSlot: 0,
    description: 'Tender pancakes with a soft center, bright lemon zest, and a quick berry topping.',
    ingredients: [
      '1 cup all-purpose flour',
      '1 teaspoon baking powder',
      '1 cup ricotta cheese',
      '2 eggs',
      '1/2 cup milk',
      '1 tablespoon sugar',
      'Butter for the pan',
      'Fresh berries and maple syrup for serving',
    ],
    steps: [
      '1. Whisk the flour and baking powder in a bowl.',
      '2. In a second bowl, mix ricotta, eggs, milk, and sugar until smooth.',
      '3. Fold the dry ingredients into the wet ingredients just until combined.',
      '4. Cook spoonfuls of batter on a lightly buttered skillet until golden on both sides.',
      '5. Serve warm with berries and maple syrup.',
    ],
    imageUrl: 'https://picsum.photos/seed/recipebox-fluffy-ricotta-pancakes/1200/800',
  },
  {
    title: 'Overnight Berry Oats',
    category: 'Breakfast',
    ownerSlot: 1,
    description: 'A make-ahead breakfast with creamy oats, yogurt, and a fresh berry finish.',
    ingredients: [
      '1 cup rolled oats',
      '1 cup milk',
      '1/2 cup plain yogurt',
      '1 tablespoon chia seeds',
      '1 teaspoon honey',
      '1 cup mixed berries',
    ],
    steps: [
      '1. Combine oats, milk, yogurt, chia seeds, and honey in a jar or container.',
      '2. Stir well, cover, and refrigerate overnight.',
      '3. In the morning, stir again and top with fresh berries.',
      '4. Serve chilled or let it sit a few minutes if you prefer it less cold.',
    ],
    imageUrl: 'https://picsum.photos/seed/recipebox-overnight-berry-oats/1200/800',
  },
  {
    title: 'Shakshuka with Feta',
    category: 'Breakfast',
    ownerSlot: 2,
    description: 'Tomatoes, peppers, and softly poached eggs finished with herbs and feta.',
    ingredients: [
      '2 tablespoons olive oil',
      '1 onion, diced',
      '1 red bell pepper, diced',
      '2 garlic cloves, minced',
      '1 can crushed tomatoes',
      '4 eggs',
      'Feta and parsley for topping',
    ],
    steps: [
      '1. Sauté onion and pepper in olive oil until softened.',
      '2. Add garlic and cook briefly, then pour in the crushed tomatoes and simmer.',
      '3. Make four small wells in the sauce and crack in the eggs.',
      '4. Cover and cook until the whites are set but the yolks are still soft.',
      '5. Finish with feta and parsley, then serve with bread.',
    ],
    imageUrl: 'https://picsum.photos/seed/recipebox-shakshuka-feta/1200/800',
  },
  {
    title: 'Lemon Herb Roast Chicken',
    category: 'Main Course',
    ownerSlot: 0,
    description: 'A simple roast chicken with crispy skin, garlic, lemon, and rosemary.',
    ingredients: [
      '1 whole chicken',
      '2 lemons, one sliced and one juiced',
      '4 garlic cloves',
      '2 tablespoons olive oil',
      'Fresh rosemary and thyme',
      'Salt and black pepper',
      'Potatoes or vegetables for roasting',
    ],
    steps: [
      '1. Preheat the oven and season the chicken inside and out.',
      '2. Stuff the cavity with lemon slices, garlic, and herbs.',
      '3. Rub the skin with olive oil and remaining lemon juice.',
      '4. Roast until the skin is golden and the juices run clear.',
      '5. Rest before carving and serve with roasted vegetables.',
    ],
    imageUrl: 'https://picsum.photos/seed/recipebox-lemon-herb-roast-chicken/1200/800',
  },
  {
    title: 'Garlic Butter Salmon with Asparagus',
    category: 'Main Course',
    ownerSlot: 1,
    description: 'Pan-seared salmon with tender asparagus and a rich garlic butter sauce.',
    ingredients: [
      '4 salmon fillets',
      '1 bunch asparagus',
      '3 tablespoons butter',
      '3 garlic cloves, minced',
      '1 lemon',
      'Salt, pepper, and dill',
    ],
    steps: [
      '1. Season the salmon with salt, pepper, and dill.',
      '2. Sear salmon in a hot pan until nearly cooked through, then set aside.',
      '3. Add butter, garlic, and asparagus to the pan and sauté until tender.',
      '4. Return the salmon to the pan and spoon the butter sauce over the top.',
      '5. Finish with lemon juice and serve immediately.',
    ],
    imageUrl: 'https://picsum.photos/seed/recipebox-garlic-butter-salmon/1200/800',
  },
  {
    title: 'Mushroom Risotto',
    category: 'Main Course',
    ownerSlot: 2,
    description: 'Creamy risotto with sautéed mushrooms, parmesan, and white wine.',
    ingredients: [
      '1 1/2 cups arborio rice',
      '8 ounces mushrooms, sliced',
      '1 onion, finely chopped',
      '4 cups warm vegetable stock',
      '1/2 cup white wine',
      '1/2 cup parmesan cheese',
      '2 tablespoons butter',
    ],
    steps: [
      '1. Sauté the mushrooms and set them aside.',
      '2. Cook the onion in butter, then stir in the arborio rice.',
      '3. Add wine and let it absorb, then add warm stock one ladle at a time.',
      '4. Stir until the rice is creamy and tender.',
      '5. Fold in mushrooms and parmesan before serving.',
    ],
    imageUrl: 'https://picsum.photos/seed/recipebox-mushroom-risotto/1200/800',
  },
  {
    title: 'Crunchy Chickpea Salad',
    category: 'Salad',
    ownerSlot: 0,
    description: 'A bright salad with crisp vegetables, roasted chickpeas, and a lemon dressing.',
    ingredients: [
      '1 can chickpeas',
      '1 cucumber',
      '2 tomatoes',
      '1 bell pepper',
      'A handful of arugula',
      '2 tablespoons olive oil',
      '1 tablespoon lemon juice',
    ],
    steps: [
      '1. Roast the chickpeas until crisp and lightly golden.',
      '2. Chop the vegetables and toss them with arugula in a bowl.',
      '3. Whisk olive oil, lemon juice, salt, and pepper for the dressing.',
      '4. Add the chickpeas and dressing to the salad just before serving.',
    ],
    imageUrl: 'https://picsum.photos/seed/recipebox-chickpea-salad/1200/800',
  },
  {
    title: 'Mediterranean Cucumber Tomato Salad',
    category: 'Salad',
    ownerSlot: 1,
    description: 'A refreshing chopped salad with olives, herbs, and a sharp vinaigrette.',
    ingredients: [
      '2 cucumbers',
      '3 tomatoes',
      '1/2 red onion',
      'Handful of olives',
      'Fresh parsley and mint',
      'Olive oil and red wine vinegar',
    ],
    steps: [
      '1. Chop the cucumbers, tomatoes, and onion into bite-size pieces.',
      '2. Combine with olives and fresh herbs in a large bowl.',
      '3. Whisk olive oil, vinegar, salt, and pepper.',
      '4. Toss the salad with the vinaigrette right before serving.',
    ],
    imageUrl: 'https://picsum.photos/seed/recipebox-mediterranean-salad/1200/800',
  },
  {
    title: 'Creamy Tomato Basil Soup',
    category: 'Soup',
    ownerSlot: 2,
    description: 'A comforting soup with sweet tomatoes, basil, and a smooth creamy finish.',
    ingredients: [
      '2 tablespoons butter',
      '1 onion, chopped',
      '2 garlic cloves, minced',
      '2 cans crushed tomatoes',
      '2 cups vegetable stock',
      '1/2 cup cream',
      'Fresh basil leaves',
    ],
    steps: [
      '1. Sauté onion and garlic in butter until fragrant.',
      '2. Add tomatoes and stock, then simmer for about 20 minutes.',
      '3. Blend until smooth and return to the pot.',
      '4. Stir in cream and basil, then season to taste.',
      '5. Serve hot with toasted bread.',
    ],
    imageUrl: 'https://picsum.photos/seed/recipebox-tomato-basil-soup/1200/800',
  },
  {
    title: 'Roasted Butternut Squash Soup',
    category: 'Soup',
    ownerSlot: 0,
    description: 'A silky squash soup with warm spice, apple, and a touch of cream.',
    ingredients: [
      '1 butternut squash',
      '1 apple',
      '1 onion',
      '3 cups vegetable stock',
      '1/2 teaspoon cinnamon',
      '1/4 teaspoon nutmeg',
      'Cream for serving',
    ],
    steps: [
      '1. Roast the squash until caramelized and tender.',
      '2. Sauté onion and apple in a pot with a little oil.',
      '3. Add the roasted squash, stock, and spices, then simmer briefly.',
      '4. Blend until silky smooth.',
      '5. Serve with cream and toasted seeds if desired.',
    ],
    imageUrl: 'https://picsum.photos/seed/recipebox-butternut-squash-soup/1200/800',
  },
  {
    title: 'Coconut Lentil Curry',
    category: 'Vegan',
    ownerSlot: 1,
    description: 'A cozy plant-based curry with red lentils, coconut milk, and warm spices.',
    ingredients: [
      '1 tablespoon coconut oil',
      '1 onion, diced',
      '2 garlic cloves',
      '1 tablespoon curry powder',
      '1 cup red lentils',
      '1 can coconut milk',
      '2 cups vegetable stock',
      'Spinach and lime for finishing',
    ],
    steps: [
      '1. Cook the onion and garlic in coconut oil until soft.',
      '2. Stir in the curry powder and toast for a minute.',
      '3. Add the lentils, coconut milk, and stock, then simmer until tender.',
      '4. Stir in spinach until wilted and season to taste.',
      '5. Finish with lime juice and serve over rice.',
    ],
    imageUrl: 'https://picsum.photos/seed/recipebox-coconut-lentil-curry/1200/800',
  },
  {
    title: 'Dark Chocolate Berry Tart',
    category: 'Dessert',
    ownerSlot: 2,
    description: 'A crisp tart shell filled with chocolate ganache and finished with fresh berries.',
    ingredients: [
      '1 tart shell',
      '200 g dark chocolate',
      '1 cup cream',
      '1 tablespoon butter',
      'Fresh berries',
      'Mint leaves for garnish',
    ],
    steps: [
      '1. Warm the cream until just simmering, then pour it over chopped chocolate.',
      '2. Stir until smooth and glossy, then mix in the butter.',
      '3. Pour the ganache into the tart shell and chill until set.',
      '4. Arrange berries on top before serving.',
    ],
    imageUrl: 'https://picsum.photos/seed/recipebox-dark-chocolate-berry-tart/1200/800',
  },
];

function buildRecipePayloads(users, categories) {
  const categoryIdByName = new Map(categories.map((category) => [category.name, category.id]));

  return seedRecipes.map((recipe) => {
    const owner = users[recipe.ownerSlot % users.length];

    return {
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients.join('\n'),
      steps: recipe.steps.join('\n'),
      image_url: recipe.imageUrl,
      category_id: categoryIdByName.get(recipe.category),
      owner_id: owner.id,
    };
  });
}

async function getSeedUsers() {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 100,
  });

  if (error) {
    throw new Error(`Failed to list auth users: ${error.message}`);
  }

  const users = data.users
    .filter((user) => !user.deleted_at)
    .sort((left, right) => new Date(left.created_at) - new Date(right.created_at));

  if (users.length < 3) {
    throw new Error(`Need at least 3 existing users to seed recipes, but found ${users.length}.`);
  }

  return users.slice(0, 3);
}

async function seedCategories() {
  const { data, error } = await supabase
    .from('categories')
    .upsert(seedCategoryNames.map((name) => ({ name })), { onConflict: 'name' })
    .select('id, name')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to seed categories: ${error.message}`);
  }

  return data;
}

async function replaceSampleRecipes(recipes) {
  const titles = recipes.map((recipe) => recipe.title);

  const deleteResult = await supabase.from('recipes').delete().in('title', titles);
  if (deleteResult.error) {
    throw new Error(`Failed to remove existing sample recipes: ${deleteResult.error.message}`);
  }

  const { error } = await supabase.from('recipes').insert(recipes);
  if (error) {
    throw new Error(`Failed to insert sample recipes: ${error.message}`);
  }
}

async function main() {
  console.log('Starting RecipeBox seed...');

  const users = await getSeedUsers();
  console.log(
    `Using seed owners: ${users.map((user) => user.email ?? user.id).join(', ')}`
  );

  const categories = await seedCategories();
  console.log(`Seeded ${categories.length} categories.`);

  const recipes = buildRecipePayloads(users, categories);
  await replaceSampleRecipes(recipes);

  console.log(`Seeded ${recipes.length} recipes.`);
  console.log('RecipeBox seed complete.');
}

main().catch((error) => {
  console.error('RecipeBox seed failed.');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});