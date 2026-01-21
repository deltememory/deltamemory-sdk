import { DeltaMemory } from 'deltamemory';

const db = new DeltaMemory({
  apiKey: process.env.DELTAMEMORY_API_KEY,
  baseUrl: process.env.DELTAMEMORY_URL,
  defaultCollection: 'hello-world'
});

async function main() {
  // Store a memory
  console.log('Storing memory...');
  await db.ingest('I love TypeScript and building AI applications');
  
  // Recall the memory
  console.log('Recalling memory...');
  const result = await db.recall('What do I love?');
  
  // Print results
  console.log('\n=== Memories ===');
  result.results.forEach(({ memory, cognitive_score }) => {
    console.log(`[${cognitive_score.toFixed(2)}] ${memory.content}`);
  });
  
  console.log('\n=== User Profile ===');
  result.profiles?.forEach(profile => {
    console.log(`${profile.topic}::${profile.sub_topic}: ${profile.content}`);
  });
}

main().catch(console.error);
