import asyncio
import os
from deltamemory import DeltaMemory

async def main():
    db = DeltaMemory(
        api_key=os.environ.get('DELTAMEMORY_API_KEY'),
        base_url=os.environ.get('DELTAMEMORY_URL'),
        default_collection='hello-world'
    )
    
    async with db:
        # Store a memory
        print('Storing memory...')
        await db.ingest('I love Python and building AI applications')
        
        # Recall the memory
        print('Recalling memory...')
        result = await db.recall('What do I love?')
        
        # Print results
        print('\n=== Memories ===')
        for item in result.results:
            print(f"[{item.cognitive_score:.2f}] {item.memory.content}")
        
        print('\n=== User Profile ===')
        if result.profiles:
            for profile in result.profiles:
                print(f"{profile.topic}::{profile.sub_topic}: {profile.content}")

if __name__ == '__main__':
    asyncio.run(main())
