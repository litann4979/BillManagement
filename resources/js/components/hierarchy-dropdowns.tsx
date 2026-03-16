import { useState, useEffect } from 'react';

interface HierarchyItem {
    id: number;
    name?: string;
    dtr_name?: string;
    dtr_code?: string;
}

interface HierarchyValues {
    circle_id: string;
    division_id: string;
    subdivision_id: string;
    section_id: string;
    village_id: string;
    feeder_id: string;
    dtr_id: string;
}

interface HierarchyDropdownsProps {
    values: HierarchyValues;
    onChange: (key: keyof HierarchyValues, value: string) => void;
    circles: HierarchyItem[];
    /** Which levels to show. Defaults to all. */
    showLevels?: Array<keyof HierarchyValues>;
}

export default function HierarchyDropdowns({
    values,
    onChange,
    circles,
    showLevels,
}: HierarchyDropdownsProps) {
    const [divisions, setDivisions] = useState<HierarchyItem[]>([]);
    const [subdivisions, setSubdivisions] = useState<HierarchyItem[]>([]);
    const [sections, setSections] = useState<HierarchyItem[]>([]);
    const [villages, setVillages] = useState<HierarchyItem[]>([]);
    const [feeders, setFeeders] = useState<HierarchyItem[]>([]);
    const [dtrs, setDtrs] = useState<HierarchyItem[]>([]);

    const show = (key: keyof HierarchyValues) =>
        !showLevels || showLevels.includes(key);

    // Fetch divisions when circle changes
    useEffect(() => {
        if (values.circle_id) {
            fetch(`/api/divisions/${values.circle_id}`)
                .then((res) => res.json())
                .then(setDivisions);
        } else {
            setDivisions([]);
        }
    }, [values.circle_id]);

    // Fetch subdivisions when division changes
    useEffect(() => {
        if (values.division_id) {
            fetch(`/api/subdivisions/${values.division_id}`)
                .then((res) => res.json())
                .then(setSubdivisions);
        } else {
            setSubdivisions([]);
        }
    }, [values.division_id]);

    // Fetch sections when subdivision changes
    useEffect(() => {
        if (values.subdivision_id) {
            fetch(`/api/sections/${values.subdivision_id}`)
                .then((res) => res.json())
                .then(setSections);
        } else {
            setSections([]);
        }
    }, [values.subdivision_id]);

    // Fetch villages + feeders when section changes
    useEffect(() => {
        if (values.section_id) {
            fetch(`/api/villages/${values.section_id}`)
                .then((res) => res.json())
                .then(setVillages);
            fetch(`/api/feeders/${values.section_id}`)
                .then((res) => res.json())
                .then(setFeeders);
        } else {
            setVillages([]);
            setFeeders([]);
        }
    }, [values.section_id]);

    // Fetch dtrs when feeder changes
    useEffect(() => {
        if (values.feeder_id) {
            fetch(`/api/dtrs/${values.feeder_id}`)
                .then((res) => res.json())
                .then(setDtrs);
        } else {
            setDtrs([]);
        }
    }, [values.feeder_id]);

    const selectClass =
        'w-full border rounded px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {show('circle_id') && (
                <div>
                    <label className="block text-sm font-medium mb-1">Circle</label>
                    <select
                        value={values.circle_id}
                        onChange={(e) => {
                            onChange('circle_id', e.target.value);
                            onChange('division_id', '');
                            onChange('subdivision_id', '');
                            onChange('section_id', '');
                            onChange('village_id', '');
                            onChange('feeder_id', '');
                            onChange('dtr_id', '');
                        }}
                        className={selectClass}
                    >
                        <option value="">— Select Circle —</option>
                        {circles.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {show('division_id') && (
                <div>
                    <label className="block text-sm font-medium mb-1">Division</label>
                    <select
                        value={values.division_id}
                        onChange={(e) => {
                            onChange('division_id', e.target.value);
                            onChange('subdivision_id', '');
                            onChange('section_id', '');
                            onChange('village_id', '');
                            onChange('feeder_id', '');
                            onChange('dtr_id', '');
                        }}
                        disabled={!values.circle_id}
                        className={selectClass}
                    >
                        <option value="">— Select Division —</option>
                        {divisions.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {show('subdivision_id') && (
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Subdivision
                    </label>
                    <select
                        value={values.subdivision_id}
                        onChange={(e) => {
                            onChange('subdivision_id', e.target.value);
                            onChange('section_id', '');
                            onChange('village_id', '');
                            onChange('feeder_id', '');
                            onChange('dtr_id', '');
                        }}
                        disabled={!values.division_id}
                        className={selectClass}
                    >
                        <option value="">— Select Subdivision —</option>
                        {subdivisions.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {show('section_id') && (
                <div>
                    <label className="block text-sm font-medium mb-1">Section</label>
                    <select
                        value={values.section_id}
                        onChange={(e) => {
                            onChange('section_id', e.target.value);
                            onChange('village_id', '');
                            onChange('feeder_id', '');
                            onChange('dtr_id', '');
                        }}
                        disabled={!values.subdivision_id}
                        className={selectClass}
                    >
                        <option value="">— Select Section —</option>
                        {sections.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {show('village_id') && (
                <div>
                    <label className="block text-sm font-medium mb-1">Village</label>
                    <select
                        value={values.village_id}
                        onChange={(e) => onChange('village_id', e.target.value)}
                        disabled={!values.section_id}
                        className={selectClass}
                    >
                        <option value="">— Select Village —</option>
                        {villages.map((v) => (
                            <option key={v.id} value={v.id}>
                                {v.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {show('feeder_id') && (
                <div>
                    <label className="block text-sm font-medium mb-1">Feeder</label>
                    <select
                        value={values.feeder_id}
                        onChange={(e) => {
                            onChange('feeder_id', e.target.value);
                            onChange('dtr_id', '');
                        }}
                        disabled={!values.section_id}
                        className={selectClass}
                    >
                        <option value="">— Select Feeder —</option>
                        {feeders.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {show('dtr_id') && (
                <div>
                    <label className="block text-sm font-medium mb-1">DTR</label>
                    <select
                        value={values.dtr_id}
                        onChange={(e) => onChange('dtr_id', e.target.value)}
                        disabled={!values.feeder_id}
                        className={selectClass}
                    >
                        <option value="">— Select DTR —</option>
                        {dtrs.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.dtr_name} {d.dtr_code ? `(${d.dtr_code})` : ''}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}
