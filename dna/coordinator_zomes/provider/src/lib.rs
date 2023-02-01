use hdk::prelude::*;
use provider_integrity::{EntryTypes, ProviderEntry};

#[hdk_extern]
pub fn create_provider_entry(
    provider_entry: ProviderEntry
) -> ExternResult<ActionHash> {
    let action_hash = create_entry(EntryTypes::ProviderEntry(provider_entry.clone()))?;
    let _entry_hash = hash_entry(provider_entry.clone())?;
    Ok(action_hash)
}

#[hdk_extern]
pub fn all_provider_resource_entry_hashes(_: ()) -> ExternResult<Vec<EntryHash>> {
    Ok(vec![])
}